import { Api as ApiAuth, GrantDefaults, GrantProvider, Host, WebHook } from 'auth';
import { Collection, Message, WebhookClient } from 'discord.js';
import { Express, NextFunction, Request, Response } from 'express';
import * as fs from 'fs-extra';
import * as knex from 'knex';
import fetch from 'node-fetch';
import { resolve } from 'path';
// @ts-ignore
import { api, database, grant, hook, host, rootURL } from '../auth/auth';
import * as logger from '../util/console';
import { handleApiError, handleSiteError, IErrorHandlerObject } from '../util/handleError';
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
      grant,
      hook,
      host,
      rootURL
    };

    this.util = {
      handleApiError,
      handleSiteError,
      collection: (...args) => new Collection(args),
      db: knex(database),
      logger: {
        error: (message: string) => logger.error(`Server: ${message}`),
        status: (message: string) => logger.status(`Server: ${message}`),
        warn: (message: string) => logger.warn(`Server: ${message}`)
      },
      webHookSend: (message: string) => new WebhookClient(hook.id, hook.token).send(message)
    };

    this.api = new Collection();

    this.rateLimits = new Collection();

    this.recentVisitors = new Collection();

    this.kamihimeCache = [];
  }

  public client: Client;
  public auth: IAuth;
  public util: IUtil;
  public api: Collection<string, Collection<string, Api>>;
  public rateLimits: Collection<string, Collection<string, Collection<string, any>>>;
  public recentVisitors: Collection<string, Collection<string, number>>;
  public kamihimeCache: any[];

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

        this.api.get(method).set(request, file);
        this.rateLimits.get(method).set(request, new Collection());

        this.util.logger.status(`-- ${request} Collection is set.`);
      }
    }

    // Routes
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

      server[file.method](file.route, (req: Request, res: Response, next: NextFunction) => file.exec(req, res, next));
    }

    server
      .all('*', (_, res) => res.render('invalids/403'))
      .listen(host.port);

    this.util.logger.status(`Listening to ${host.address}:80`);

    return this;
  }

  /**
   * Calls cleaner functions every time specified from GENERAL_COOLDOWN
   * @param forced Whether the call is forced or not [can be forced thru server API (api/refresh)]
   */
  public startCleaners (forced: boolean = false): this {
    Promise.all([ this._cleanRateLimits(), this._cleanSessions(), this._cleanVisitors() ])
      .then(() => this.util.logger.status('Cleanup Rotation Occurred.'))
      .catch(this.util.logger.error);

    if (!forced)
      setTimeout(() => this.startCleaners(), GENERAL_COOLDOWN);

    return this;
  }

  public startKamihimeCache (): this {
    fetch(`${this.auth.rootURL}api/list`)
      .then(res => res.json())
      .then(cache => {
        this.kamihimeCache = cache;

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
          const timeLapsed: number = Date.now() - u.timestamp;
          const cooldown: number = requestInstance.cooldown * 1000;

          return timeLapsed > cooldown;
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

  protected async _cleanSessions (): Promise<boolean> {
    try {
      const EXPIRED: string = 'created <= DATE_SUB(NOW(), INTERVAL \'30:00\' MINUTE_SECOND)';
      const sessions: any[] = await this.util.db('sessions').select('id')
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

  protected async _cleanVisitors (): Promise<boolean> {
    const resources = this.recentVisitors;
    let cleaned: number = 0;

    for (const resource of resources.keys()) {
      const log = resources.get(resource);
      const visitors = log.filter(u => {
        const timeLapsed: number = Date.now() - u;

        return timeLapsed > GENERAL_COOLDOWN;
      });

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

interface IAuth {
  database: knex.Config;
  host: Host;
  grant: IGrant;
  rootURL: string;
  api: ApiAuth;
  hook: WebHook;
}

interface IGrant {
  defaults: GrantDefaults;
  discord: GrantProvider;
}

interface ILogger {
  status: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
}

interface IUtil {
  collection: () => Collection<any, any>;
  db: knex;
  handleApiError: (res: Response, err: IErrorHandlerObject) => void;
  handleSiteError: (res: Response, err: IErrorHandlerObject) => void;
  logger: ILogger;
  webHookSend: (message: string) => Promise<Message | Message[]>;
}
