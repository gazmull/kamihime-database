import { Collection } from 'discord.js';
import { Express, NextFunction, Request, Response } from 'express';
import * as fs from 'fs-extra';
import * as knex from 'knex';
import fetch from 'node-fetch';
import { resolve } from 'path';
// @ts-ignore
import { api, database, discord, exempt, host, rootURL } from '../auth/auth';
import * as logger from '../util/console';
import Api from './Api';
import Client from './Client';
import Route from './Route';

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
      db: knex(database),
      logger: {
        error: message => logger.error(message),
        status: (message: string) => logger.status(message),
        warn: (message: string) => logger.warn(message),
      },
    };

    this.api = new Collection();

    this.rateLimits = new Collection();

    this.states = new Collection();

    this.visitors = new Collection();

    this.kamihime = [];
  }

  public client: Client;
  public auth: IAuth;
  public util: IUtil;
  public api: Collection<string, Collection<string, Api>>;
  public rateLimits: Collection<string, Collection<string, Collection<string, IRateLimitLog>>>;
  public states: Collection<string, IState>;
  public visitors: Collection<string, Collection<string, number>>;
  public kamihime: IKamihime[];

  public init (server: Express, client: Client): this {
    this.client = client;

    // Api
    const API_METHODS_DIR: string = resolve(__dirname, '../api');
    const methods: string[] = fs.readdirSync(API_METHODS_DIR);

    for (const method of methods) {
      this.api.set(method, new Collection());
      this.rateLimits.set(method, new Collection());
      this.util.logger.status(`API: Ratelimiter: Method ${method.toUpperCase()}`);

      const API_METHOD_REQUESTS_DIR = resolve(API_METHODS_DIR, method);
      let requests: string[] = fs.readdirSync(API_METHOD_REQUESTS_DIR);
      requests = requests.map(el => el.slice(0, el.indexOf('.js')));

      for (const request of requests) {
        const file: Api = new (require(resolve(API_METHOD_REQUESTS_DIR, request)).default)();
        file.server = this;
        file.client = client;
        Object.assign(file.util, {  ...this.client.util });

        this.api.get(method).set(request, file);
        this.rateLimits.get(method).set(request, new Collection());

        this.util.logger.status(`-- ${request} Collection is set.`);
      }
    }

    // Routes

    server.get('*', (req, res, next) => {
      if (!req.cookies.verified && !(req.xhr || req.headers.accept && req.headers.accept.includes('application/json')))
        return res.render('invalids/disclaimer', { redirected: true });

      return next();
    });

    const ROUTES_DIR: string = resolve(__dirname, '../routes');
    const routeDir: string[] = fs.readdirSync(ROUTES_DIR);

    for (const route of routeDir) {
      const file: Route = new (require(`${ROUTES_DIR}/${route}`).default)(this);

      if (!file.method) {
        this.util.logger.error(`Missing Method: Route ${route} was not included`);

        continue;
      }

      file.server = this;
      file.client = client;
      Object.assign(file.util, {  ...this.client.util });

      server[file.method](file.route, (req: Request, res: Response, next: NextFunction) => file.exec(req, res, next));
    }

    server
      .all('*', (_, res) => res.render('invalids/403'))
      .listen(host.port, () => this.util.logger.status(`Listening to http://${host.address}:${host.port}`));

    return this;
  }

  /**
   * Calls cleaner functions every time specified from GENERAL_COOLDOWN
   * @param forced Whether the call is forced or not [can be forced thru server API (api/refresh)]
   */
  public startCleaners (forced: boolean = false): this {
    Promise.all([
      this._cleanRateLimits(),
      this._cleanReports(),
      this._cleanSessions(),
      this._cleanStates(),
      this._cleanUsers(),
      this._cleanVisitors(),
    ])
      .then(() => this.util.logger.status('Cleanup Rotation Occurred.'))
      .catch(this.util.logger.error);

    if (!forced)
      setTimeout(() => this.startCleaners(), GENERAL_COOLDOWN);

    return this;
  }

  public startKamihimeCache (): this {
    fetch(`${this.auth.rootURL}api/list`, { headers: { Accept: 'application/json' } })
      .then(res => res.json())
      .then(cache => {
        this.kamihime = cache;

        this.util.logger.status('Refreshed Kamihime Cache.');
        setTimeout(() => this.startKamihimeCache(), GENERAL_COOLDOWN);
      })
      .catch(this.util.logger.error);

    return this;
  }

  protected async _cleanRateLimits (): Promise<boolean> {
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

        this.util.logger.status(`API users cleanup finished (Req: ${method}->${request}). Cleaned: ${users.size}`);
      }
    }

    return true;
  }

  protected async _cleanReports (): Promise<boolean> {
    try {
      const expired = 'DATE_ADD(date, INTERVAL IF(userId LIKE \'%:%\', 24, 3) HOUR) < NOW()';
      const reports: IReport[] = await this.util.db('reports').select('userId')
        .whereRaw(expired);

      if (reports.length) {
        await this.util.db('reports').whereRaw(expired).delete();

        this.util.logger.status('Existing Reports cleanup finished.');

        return true;
      }
    } catch (err) {
      this.util.logger.error(err);
    }
  }

  protected async _cleanSessions (): Promise<boolean> {
    try {
      const EXPIRED = 'created <= DATE_SUB(NOW(), INTERVAL 30 MINUTE)';
      const sessions: ISession[] = await this.util.db('sessions').select('id')
        .whereRaw(EXPIRED);

      if (sessions.length) {
        await this.util.db('sessions').whereRaw(EXPIRED).delete();

        this.util.logger.status('Existing Sessions cleanup finished.');

        return true;
      }
    } catch (err) {
      this.util.logger.error(err);
    }
  }

  protected async _cleanStates (): Promise<boolean> {
    let cleaned = 0;
    const states = this.states.filter(s => Date.now() > (s.timestamp + 18e5));

    for (const state of states.keys())
      this.states.delete(state);

    cleaned += states.size;

    if (cleaned)
      this.util.logger.status(`Login Slugs cleanup finished. Cleaned: ${cleaned}`);

    return true;
  }

  protected async _cleanUsers (): Promise<boolean> {
    try {
      const EXPIRED = 'lastLogin <= DATE_SUB(NOW(), INTERVAL 14 DAY)';
      const users: IUser[] = await this.util.db('users').select('userId')
        .whereRaw(EXPIRED);

      if (users.length) {
        await this.util.db('users').whereRaw(EXPIRED).delete();

        this.util.logger.status('Existing Inactive Users cleanup finished.');

        return true;
      }
    } catch (err) {
      this.util.logger.error(err);
    }
  }

  protected async _cleanVisitors (): Promise<boolean> {
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
      this.util.logger.status(`Player visitors cleanup finished. Cleaned: ${cleaned}`);

    return true;
  }
}
