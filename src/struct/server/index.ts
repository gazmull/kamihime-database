import Winston from '@gazmull/logger';
import { Collection, TextChannel } from 'discord.js';
import { Express, Router } from 'express';
import * as knex from 'knex';
import fetch from 'node-fetch';
// tslint:disable-next-line:max-line-length
import { IAuth, IKamihime, IPasswordAttempts, IRateLimitLog, IReport, ISession, IState, IUser, IUtil } from '../../../typings';
import { Auth } from '../../../typings/auth';
import authHandler from '../../middleware/auth-handler';
import { handleApiError, handleSiteError } from '../../util/handleError';
import ApiRoute from '../ApiRoute';
import Client from '../Client';
import ApiController from './controllers/api';
import SiteController from './controllers/site';
// tslint:disable-next-line: no-var-requires
const { api, database, discord, exempt, host, rootURL } = require('../../../auth') as Auth;

let serverStoresRefresh: NodeJS.Timeout = null;
let serverKamihimeRefresh: NodeJS.Timeout = null;

const GENERAL_COOLDOWN: number = 1000 * 60 * 3;

export default class Server {
  public client: Client;

  public auth: IAuth = {
    api,
    database,
    discord,
    exempt,
    host,
    rootURL
  };

  public util: IUtil = {
    handleApiError,
    handleSiteError,
    db: knex(database),
    logger: new Winston('khdb').logger,
    collection: <K, V>() => new Collection<K, V>(),
    discordSend: (channelId, message) => {
      const channel = this.client.discord.channels.get(channelId) as TextChannel;

      if (!channel) return this.util.logger.warn(`Channel ${channelId} does not exist.`);

      return channel.send(message);
    }
  };

  public stores = {
    api: new Collection<string, Collection<string, ApiRoute>>(),
    rateLimits: new Collection<string, Collection<string, Collection<string, IRateLimitLog>>>(),
    states: new Collection<string, IState>(),
    passwordAttempts: new Collection<string, IPasswordAttempts>(),
    visitors: new Collection<string, Collection<string, number>>()
  };

  public kamihime: IKamihime[] = [];

  public status: {
    date: number,
    content: string
  };

  get production () {
    return process.env.NODE_ENV === 'production';
  }

  public async init (express: Express, client: Client) {
    this.client = client;

    // Website status message
    this.util.db('status').select('message', 'date')
      .orderBy('date', 'desc')
      .limit(1)
      .then(([ msg ]) => this.status = msg ? { content: msg.message, date: new Date(msg.date).valueOf() } : null)
      .catch(this.util.logger.error);

    // Routes
    const Api: Router = await ApiController.init.call(this);
    const Site: Router = await SiteController.init.call(this);

    // Routes Auth Handler
    express.use(authHandler.call(this));

    // Finalise routes
    express
      .use('/api', Api)
      .get('*', (req, res, next) => {
        if (!/latest$/i.test(req.originalUrl) && !req.cookies.verified)
          return res.render('invalids/disclaimer', { redirected: true });

        return next();
      })
      .use('/', Site);

    const protocol = this.production ? 'https' : 'http';

    express.listen(host.port, () => this.util.logger.info(`Listening to ${protocol}://${host.address}:${host.port}`));

    return this;
  }

  /**
   * Calls cleaner functions every time specified from GENERAL_COOLDOWN
   * @param forced Whether the call is forced or not [can be forced thru server API (api/refresh)]
   */
  public startCleaners (forced = false) {
    Promise.all([
      this._cleanRateLimits(),
      this._cleanReports(),
      this._cleanSessions(),
      this._cleanStates(),
      this._cleanUsers(),
      this._cleanVisitors(),
    ])
      .then(() => this.util.logger.info('Cleanup Rotation Occurred.'))
      .catch(this.util.logger.error);

    if (forced) {
      clearTimeout(serverStoresRefresh);
      serverStoresRefresh = setTimeout(() => this.startCleaners(), GENERAL_COOLDOWN);
    } else
      serverStoresRefresh = setTimeout(() => this.startCleaners(), GENERAL_COOLDOWN);

    return this;
  }

  public startKamihimeCache (forced = false) {
    fetch(`${this.auth.rootURL}api/list?internal=true`, { headers: { Accept: 'application/json' } })
      .then(res => res.json())
      .then(cache => {
        this.kamihime = cache;

        this.util.logger.info('Refreshed Kamihime Cache.');
      })
      .catch(this.util.logger.error);

    if (forced) {
      clearTimeout(serverKamihimeRefresh);
      serverKamihimeRefresh = setTimeout(() => this.startKamihimeCache(), GENERAL_COOLDOWN);
    } else
      serverKamihimeRefresh = setTimeout(() => this.startKamihimeCache(), GENERAL_COOLDOWN);

    return this;
  }

  protected async _cleanRateLimits () {
    const methods = this.stores.api;

    for (const method of methods.keys()) {
      const requests = methods.get(method);

      for (const request of requests.keys()) {
        const users = this.stores.rateLimits.get(method).get(request).filter(u => {
          const requestInstance = methods.get(method).get(request);
          const cooldown: number = requestInstance.cooldown * 1000;

          return Date.now() > (u.timestamp + cooldown);
        });

        if (!users.size) continue;

        for (const user of users.keys()) {
          const _users = this.stores.rateLimits.get(method).get(request);

          _users.delete(user);
        }

        this.util.logger.info(`API users cleanup finished (Req: ${method}->${request}). Cleaned: ${users.size}`);
      }
    }

    return true;
  }

  protected async _cleanReports () {
    try {
      const expired = 'DATE_ADD(date, INTERVAL IF(userId LIKE \'%:%\', 24, 3) HOUR) < NOW()';
      const reports: IReport[] = await this.util.db('reports').select('userId')
        .whereRaw(expired);

      if (reports.length) {
        await this.util.db('reports').whereRaw(expired).delete();

        this.util.logger.info('Existing Reports cleanup finished.');

        return true;
      }
    } catch (err) {
      this.util.logger.error(err);
    }
  }

  protected async _cleanSessions () {
    try {
      const EXPIRED = 'created <= DATE_SUB(NOW(), INTERVAL 30 MINUTE)';
      const sessions: ISession[] = await this.util.db('sessions').select('id')
        .whereRaw(EXPIRED);

      if (sessions.length) {
        await this.util.db('sessions').whereRaw(EXPIRED).delete();

        this.util.logger.info('Existing Sessions cleanup finished.');

        return true;
      }
    } catch (err) {
      this.util.logger.error(err);
    }
  }

  protected async _cleanStates () {
    let cleaned = 0;
    const states = this.stores.states.filter(s => Date.now() > (s.timestamp + 18e5));

    for (const state of states.keys())
      this.stores.states.delete(state);

    cleaned += states.size;

    if (cleaned)
      this.util.logger.info(`Login Slugs cleanup finished. Cleaned: ${cleaned}`);

    return true;
  }

  protected async _cleanUsers () {
    try {
      const EXPIRED = 'lastLogin <= DATE_SUB(NOW(), INTERVAL 14 DAY)';
      const users: IUser[] = await this.util.db('users').select('userId')
        .whereRaw(EXPIRED);

      if (users.length) {
        await this.util.db('users').whereRaw(EXPIRED).delete();

        this.util.logger.info('Existing Inactive Users cleanup finished.');

        return true;
      }
    } catch (err) {
      this.util.logger.error(err);
    }
  }

  protected async _cleanVisitors () {
    const resources = this.stores.visitors;
    let cleaned = 0;

    for (const resource of resources.keys()) {
      const log = resources.get(resource);
      const visitors = log.filter(u => Date.now() > (u + GENERAL_COOLDOWN));

      for (const visitor of visitors.keys())
        log.delete(visitor);

      cleaned += visitors.size;

      if (!log.size)
        resources.delete(resource);
    }

    if (cleaned)
      this.util.logger.info(`Player visitors cleanup finished. Cleaned: ${cleaned}`);

    return true;
  }
}
