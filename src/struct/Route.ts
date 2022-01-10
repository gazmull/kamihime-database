import { IRouteOptions, IScript } from '../../typings';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs-extra';
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

  /**
   * Finds the file for requested episode.
   * @param name The name of the file
   * @param id The character ID
   * @param res The Resource ID for given template
   */
   public async _find (name: string, id: string, res: string): Promise<IScript | string[]> {
    const filePath = `${this.server.auth.dirs.h.scenarios}${id}/${res}/${name}`;

    try {
      const buffer = await fs.readFile(filePath);
      const text = buffer.toString();

      if (name === 'script.json')
        return JSON.parse(text);

      return text.split(',');
    } catch (err) { return undefined; }
  }
}
