import { NextFunction, Request, Response } from 'express';
import Client from './Client';
import Server from './Server';

export default class Route {
  constructor (options?: IOptions) {
    this.id = options.id;

    this.method = options.method;

    this.route = options.route;

    this.server = null;

    this.client = null;
  }

  public id: string;
  public method: string;
  public route: string[];
  public server: Server;
  public client: Client;

  public exec (req: Request, res: Response, next?: NextFunction): void {
    throw new Error('You cannot invoke this base class method.');
  }
}

interface IOptions {
  id: string;
  method: string;
  route: string[];
}
