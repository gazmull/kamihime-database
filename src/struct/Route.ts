import { Request, Response, NextFunction } from 'express';
import Server from './Server';

export default class Route {
  constructor(options?: Options) {
    this.id = options.id;

    this.method = options.method;

    this.route = options.route;

    this.server = null;
  }

  id: string;
  method: string;
  route: string[];
  server: Server;

  exec(req: Request, res: Response, next?: NextFunction): void {
    throw new Error('You cannot invoke this base class method.');
  }
}

interface Options {
  id: string;
  method: string;
  route: string[];
}
