import { Collection } from 'discord.js';
import { NextFunction, Request, Response } from 'express';
import { handleApiError, handleSiteError } from '../util/handleError';
import Client from './Client';
import Server from './Server';

export default class Route {
  constructor (options?: IRouteOptions) {
    this.id = options.id;

    this.method = options.method;

    this.route = options.route;

    this.auth = options.auth;

    this.server = null;

    this.client = null;

    this.util = {
      handleApiError,
      handleSiteError,
      collection: () => new Collection(),
    };
  }

  public id: string;
  public method: string;
  public route: string[];
  public auth: boolean | 'required';
  public server: Server;
  public client: Client;
  public util: IUtil;

  public exec (req: Request, res: Response, next?: NextFunction): void {
    throw new Error('You cannot invoke this base class method.');
  }
}
