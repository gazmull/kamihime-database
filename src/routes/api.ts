import { Collection } from 'discord.js';
import { Request, Response, NextFunction } from 'express';
import Api from '../struct/Api';
import Route from '../struct/Route';

export default class ApiRoute extends Route {
  constructor() {
    super({
      id: 'api',
      method: 'all',
      route: ['/api/:request', '/api/:request/*?']
    });
  }

  exec(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!this._validateRequest(req))
        throw { code: 404, message: 'Request class not found.' };

      const request: string  = req.params.request;
      const requestClass: Api = this.server.api.get(this._getMethod(req)).get(request);

      if (req.ip.includes(this.server.auth.hostAddress)) return requestClass.exec(req, res, next);

      const requests = this.server.rateLimits.get(this._getMethod(req)).get(request);
      const user = requests.find(r => r.address === req.ip);

      if (!user) {
        this._initialise(req, requests);

        return requestClass.exec(req, res, next);
      }

      const { max: maxRequests } = requestClass;
      const cooldown = requestClass.cooldown * 1000;
      const expired = Date.now() - user.timestamp > cooldown ;

      if (expired) {
        this._initialise(req, requests);

        return requestClass.exec(req, res, next);
      } else if (user.triggers === maxRequests && !expired) {
        const remaining = (user.timestamp + cooldown) - Date.now();

        throw {
          code: 429,
          message: [
            `Maximum requests for this request has been reached (${maxRequests}/${cooldown / 1000}s).`,
            `Please wait for ${remaining / 1000} seconds.`
          ].join(' '),
          remaining
        };
      }
      this._update(req, requests);

      requestClass.exec(req, res, next);
    } catch (err) { this.server.util.handleApiError(res, err); }
  }

  protected _getMethod(req: Request): string {
    const request: string = req.params.request;
    const methods = this.server.api.keys();

    for (const method of methods) {
      const key = this.server.api.get(method).findKey((_, key) => key === request);

      if (key) return method;
    }
  }

  protected _initialise(req: Request, requests: Collection<string, any>): void {
    const request: string = req.params.request;
    requests.set(req.ip, { address: req.ip, triggers: 1, timestamp: Date.now() });

    const user = requests.get(req.ip);
    this.server.util.logger.status(
      `[I/RI] API: User: ${user.address} | request: ${this._getMethod(req)}->${request} | Triggers: ${user.triggers}`
    );
  }

  protected _update(req: Request, requests: Collection<string, any>): void {
    let user = requests.get(req.ip);
    const request: string = req.params.request;
    requests.set(req.ip, { address: req.ip, triggers: user.triggers + 1, timestamp: user.timestamp });

    user = requests.get(req.ip);
    this.server.util.logger.status(
      `[U] API: User: ${user.address} | request: ${this._getMethod(req)}->${request} | Triggers: ${user.triggers}`
    );
  }

  protected _validateRequest(req: Request): boolean {
    const request: string = req.params.request;
    const methods = this.server.api.keys();

    for (const method of methods) {
      const key = this.server.api.get(method).findKey((_, key) => key === request);

      if (key) return true;
    }

    return false;
  }
}
