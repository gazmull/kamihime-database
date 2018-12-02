import { Api as ApiAuth, WebHook } from 'auth';
import { Collection, WebhookClient, Message } from 'discord.js';
import { database, hostAddress, rootURL, api, hook } from '../auth/auth';
import { Express, Request, Response, NextFunction } from 'express';
import { handleError, ApiError } from '../util/handleError';
import { resolve } from 'path';
import * as fs from 'fs';
import * as knex from 'knex';
import * as logger from '../util/console';
import Api from './Api';
import Client from './Client';
import fetch from 'node-fetch';
import Route from './Route';

const GENERAL_COOLDOWN: number = 1000 * 60 * 3;

export default class Server {
  constructor() {
    this.client = null;

    this.auth = {
      database,
      hostAddress,
      rootURL,
      api,
      hook
    };

    this.util = {
      collection: (...args) => new Collection(args),
      db: knex(database),
      handleError,
      logger: {
        status: (message: string) => logger.status(`Server: ${message}`),
        error: (message: string) => logger.error(`Server: ${message}`),
        warn: (message: string) => logger.warn(`Server: ${message}`)
      },
      webHookSend: (message: string) => new WebhookClient(hook.id, hook.token).send(message)
    };

    this.api = new Collection();

    this.rateLimits = new Collection();

    this.recentVisitors = new Collection();

    this.kamihimeCache = [];
  }

  client: Client;
  auth: Auth;
  util: Util;
  api: Collection<string, Collection<string, Api>>;
  rateLimits: Collection<string, Collection<string, Collection<string, any>>>;
  recentVisitors: Collection<string, any>;
  kamihimeCache: any[];

  init(server: Express, client: Client): this {
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
        const file: Api = new (require(resolve(API_METHOD_REQUESTS_DIR, request)))();
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
      const file: Route = new (require(`${ROUTES_DIR}/${route}`))(this);

      if (!file.method) {
        this.util.logger.error(`Missing Method: Route ${route} was not included`);

        continue;
      }

      file.server = this;

      server[file.method](file.route, (req: Request, res: Response, next: NextFunction) => file.exec(req, res, next));
    }

    server
      .all('*', (_, res) => handleError(res, { code: 403, message: 'Forbidden.' }))
      .listen(80);

    this.util.logger.status(`Listening to ${hostAddress}:80`);

    return this;
  }

  /**
   * Calls cleaner functions every time specified from GENERAL_COOLDOWN
   * @param forced Whether the call is forced or not [can be forced thru server API (api/refresh)]
   */
  startCleaners(forced: boolean = false): this {
    Promise.all([this._cleanRateLimits(), this._cleanSessions(), this._cleanVisitors()])
      .then(() => this.util.logger.status('Cleanup Rotation Occurred.'))
      .catch(this.util.logger.error);

    if (!forced)
      setTimeout(() => this.startCleaners(), GENERAL_COOLDOWN);

    return this;
  }

  startKamihimeCache(): this {
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

  protected async _cleanRateLimits(): Promise<boolean> {
    const methods: string[] = this.api.keyArray();

    for (const method of methods) {
      const requests: string[] = this.api.get(method).keyArray();

      for (const request of requests) {
        const users = this.rateLimits.get(method).get(request).filter(u => {
          const requestInstance = this.api.get(method).get(request);
          const timeLapsed: number = Date.now() - u.timestamp;
          const cooldown: number = requestInstance.cooldown * 1000;

          return timeLapsed > cooldown;
        });

        if (!users.size) continue;

        for (const user of users.keys()) {
          const users = this.rateLimits.get(method).get(request);

          users.delete(user);
        }

        this.util.logger.status(`API users cleanup finished (Req: ${method}->${request}). Cleaned: ${users.size}`);
      }
    }

    return true;
  }

  protected async _cleanSessions(): Promise<boolean> {
    try {
      const EXPIRED: string = 'sAge <= datetime(\'now\', \'-30 minutes\')';
      const sessions: any[] = await this.util.db.select('sID').from('sessions').whereRaw(EXPIRED);

      if (sessions.length) {
        await this.util.db('sessions').whereRaw(EXPIRED).delete();

        this.util.logger.status('Existing Sessions cleanup finished.');

        return true;
      }
    } catch (err) {
      this.util.logger.error(err);
    }
  }

  protected async _cleanVisitors(): Promise<boolean> {
    const visitors = this.recentVisitors.filter(v => {
      const timeLapsed: number = Date.now() - v.expiration;

      return timeLapsed > GENERAL_COOLDOWN;
    });

    if (!visitors.size) return;

    for (const visitor of visitors.keys())
      this.recentVisitors.delete(visitor);

    this.util.logger.status(`Player visitors cleanup finished. Cleaned: ${visitors.size}`);

    return true;
  }
}

interface Auth {
  database: knex.Config;
  hostAddress: string;
  rootURL: string;
  api: ApiAuth;
  hook: WebHook;
}

interface Logger {
  status: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
}

interface Util {
  collection: () => Collection<any, any>;
  db: knex;
  handleError: (res: Response, err: ApiError) => void;
  logger: Logger;
  webHookSend: (message: string) => Promise<Message | Message[]>;
}
