import { Collection } from 'discord.js';
import { Express, Router } from 'express';
import * as fs from 'fs-extra';
import * as knex from 'knex';
import fetch from 'node-fetch';
import { resolve } from 'path';
// tslint:disable-next-line:max-line-length
import { IAuth, IKamihime, IPasswordAttempts, IRateLimitLog, IReport, ISession, IState, IUser, IUtil } from '../../typings';
import { api, database, discord, exempt, host, rootURL } from '../auth/auth';
import apiHandler from '../middleware/api-handler';
import authHandler from '../middleware/auth-handler';
import reAuthHandler from '../middleware/re-auth-handler';
import { handleApiError, handleSiteError } from '../util/handleError';
import Winston from '../util/Logger';
import processRoutes from '../util/processRoutes';
import ApiRoute from './ApiRoute';
import Client from './Client';

let serverRefreshTimeout: NodeJS.Timeout = null;

const GENERAL_COOLDOWN: number = 1000 * 60 * 3;

export default class Server {
  constructor () {
    this.client = null;

    this.auth = {
      api,
      database,
      discord,
      exempt,
      host,
      rootURL,
    };

    this.util = {
      handleApiError,
      handleSiteError,
      db: knex(database),
      logger: new Winston().logger,
    };

    this.api = new Collection();

    this.rateLimits = new Collection();

    this.states = new Collection();

    this.passwordAttempts = new Collection();

    this.visitors = new Collection();

    this.kamihime = [];

    this.status = null;
  }

  public client: Client;
  public auth: IAuth;
  public util: IUtil;
  public api: Collection<string, Collection<string, ApiRoute>>;
  public rateLimits: Collection<string, Collection<string, Collection<string, IRateLimitLog>>>;
  public states: Collection<string, IState>;
  public passwordAttempts: Collection<string, IPasswordAttempts>;
  public visitors: Collection<string, Collection<string, number>>;
  public kamihime: IKamihime[];
  public status: string;

  get production () {
    return process.env.NODE_ENV === 'production';
  }

  public async init (server: Express, client: Client) {
    this.client = client;

    // Website status message
    this.util.db('status').select('message')
      .orderBy('date', 'desc')
      .limit(1)
      .then(([ msg ]) => this.status = msg.message || null)
      .catch(this.util.logger.error);

    // Api Routes
    const Api = Router();
    const API_ROUTES_DIR: string = resolve(__dirname, '../routes/api');
    const methods: string[] = fs.readdirSync(API_ROUTES_DIR);

    for (const method of methods) {
      this.rateLimits.set(method, new Collection());
      this.util.logger.info(`API: Ratelimiter: Method ${method.toUpperCase()}`);

      const API_METHOD_ROUTES_DIR = resolve(API_ROUTES_DIR, method);
      let apiRoutes: string[] = fs.readdirSync(API_METHOD_ROUTES_DIR);
      apiRoutes = apiRoutes.map(el => el.slice(0, el.indexOf('.js')));

      await processRoutes.bind(this)(
        Api,
        { client, directory: API_METHOD_ROUTES_DIR, handler: apiHandler, routes: apiRoutes },
      );

      for (const route of apiRoutes) {
        this.rateLimits.get(method).set(route, new Collection());
        this.util.logger.info(`-- ${route} Collection is set.`);
      }
    }

    this.util.logger.info('Loaded API Routes');

    // Route Auth Handler
    server.use(authHandler.bind(this)());

    // Site Routes + Api Router
    server
      .get('*', (req, res, next) => {
        if (
          !req.cookies.verified &&
          !(req.xhr || req.headers.accept && req.headers.accept.includes('application/json'))
        )
          return res.render('invalids/disclaimer', { redirected: true });

        return next();
      })
      .use('/api', Api);

    const SITE_ROUTES_DIR: string = resolve(__dirname, '../routes/site');
    const siteRoutes: string[] = fs.readdirSync(SITE_ROUTES_DIR);

    siteRoutes.splice(siteRoutes.indexOf('api'), 1);

    await processRoutes.bind(this)(
      server,
      { client, directory: SITE_ROUTES_DIR, handler: reAuthHandler, routes: siteRoutes },
    );

    this.util.logger.info('Loaded Site Routes');

    server.all('*', (_, res) =>  res.render('invalids/403'));
    Api.all('*', (_, res) => handleApiError(res, { code: 404, message: 'API method not found.' }));

    const protocol = this.production ? 'https' : 'http';

    server.listen(host.port, () => this.util.logger.info(`Listening to ${protocol}://${host.address}:${host.port}`));

    return this;
  }

  /**
   * Calls cleaner functions every time specified from GENERAL_COOLDOWN
   * @param forced Whether the call is forced or not [can be forced thru server API (api/refresh)]
   */
  public startCleaners (forced: boolean = false) {
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
      clearTimeout(serverRefreshTimeout);
      serverRefreshTimeout = setTimeout(() => this.startCleaners(), GENERAL_COOLDOWN);
    } else
      serverRefreshTimeout = setTimeout(() => this.startCleaners(), GENERAL_COOLDOWN);

    return this;
  }

  public startKamihimeCache () {
    fetch(`${this.auth.rootURL}api/list`, { headers: { Accept: 'application/json' } })
      .then(res => res.json())
      .then(cache => {
        this.kamihime = cache;

        this.util.logger.info('Refreshed Kamihime Cache.');
        setTimeout(() => this.startKamihimeCache(), GENERAL_COOLDOWN);
      })
      .catch(this.util.logger.error);

    return this;
  }

  protected async _cleanRateLimits () {
    const methods = this.api;

    for (const method of methods.keys()) {
      const requests = methods.get(method);

      for (const request of requests.keys()) {
        const users = this.rateLimits.get(method).get(request).filter(u => {
          const requestInstance = methods.get(method).get(request);
          const cooldown: number = requestInstance.cooldown * 1000;

          return Date.now() > (u.timestamp + cooldown);
        });

        if (!users.size) continue;

        for (const user of users.keys()) {
          const _users = this.rateLimits.get(method).get(request);

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
    const states = this.states.filter(s => Date.now() > (s.timestamp + 18e5));

    for (const state of states.keys())
      this.states.delete(state);

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
    const resources = this.visitors;
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
