import { NextFunction, Request, Response } from 'express';
import Server from './Server';

export default class Api {
  constructor (options?: IOptions) {
    this.cooldown = options.cooldown || 1;

    this.max = options.max || 3;

    this.method = options.method;

    this.server = null;
  }

  public cooldown: number;
  public max: number;
  public method: string;
  public server: Server;

  public exec (req: Request, res: Response, next?: NextFunction): void {
    throw new Error('You cannot invoke this base class method.');
  }

  /**
   * Checks if the data has passed all required fields.
   *
   * Throws an error if it does not meet the requirement above.
   * @param data The data to check
   * @param except Data entries to exempt from requirement
   */
  public async _hasData (data, ...except: string[]): Promise<boolean> {
    const isExempted = entry => except.includes(entry) ? true : data[entry];
    const hasAll: boolean = isExempted('token') && isExempted('user') &&
      isExempted('id') && isExempted('name');

    if (!hasAll)
      throw { code: 403, message: 'Incomplete data.' };

    const validToken = data.token === this.server.auth.api.token;

    if (!validToken)
      throw { code: 403, message: 'Invalid token.' };

    return true;
  }

  /**
   * Filters an object.
   * @param obj Object to filter
   * @param fn Function to use as filter
   */
  public _filter (obj: object, fn: (el: any) => any): object {
    return Object.keys(obj)
      .filter(el => fn(obj[el]))
      .reduce((prev, cur) => Object.assign(prev, { [cur]: obj[cur] }), {});
  }
}

interface IOptions {
  cooldown?: number;
  max?: number;
  method: string;
}
