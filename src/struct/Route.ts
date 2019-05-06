import { NextFunction, Request, Response } from 'express';
import { IRouteOptions } from '../../typings';
import Client from './Client';
import Server from './server';

export default class Route {
  constructor (options?: IRouteOptions) {
    this.id = options.id;

    this.method = options.method;

    this.route = options.route;

    this.auth = options.auth;
  }

  public id: string;
  public method: string;
  public route: string[];
  public auth: boolean | 'admin';
  public server: Server;
  public client: Client;

  public exec (req: Request, res: Response, next?: NextFunction) {
    throw new Error('You cannot invoke this base class method.');
  }
}
