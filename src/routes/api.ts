import { Collection } from 'discord.js';
import { NextFunction, Request, Response } from 'express';
import Api from '../struct/Api';
import Route from '../struct/Route';

export default class ApiRoute extends Route {
  constructor () {
    super({
      id: 'api',
      method: 'all',
      route: [ '/api/:request', '/api/:request/*?' ],
    });
  }

  public exec (req: Request, res: Response, next: NextFunction): void {
    try {
      if (!this._getMethod(req))
        throw { code: 404, message: 'Request class not found.' };

      const request: string  = req.params.request;
      const requestClass: Api = this.server.api.get(this._getMethod(req)).get(request);
      const ip = req.ip;

      if (
        ip.includes(this.server.auth.host.address) ||
        (req.signedCookies.userId && this.server.auth.exempt.includes(req.signedCookies.userId))
      )
        return requestClass.exec(req, res, next);

      const requests = this.server.rateLimits.get(this._getMethod(req)).get(request);
      let user = requests.find(r => r.address === ip);

      if (!user) {
        user = this._initialise(req, requests);

        this._setHeaders(res, user, requestClass.max, user.timestamp + (requestClass.cooldown * 1000));

        return requestClass.exec(req, res, next);
      }

      const { cooldown, max: maxRequests } = requestClass;
      const now = Date.now();
      const expiration = user.timestamp + (cooldown * 1000);
      const expired = now > expiration;

      this._setHeaders(res, user, maxRequests, expiration);

      if (expired) {
        this._initialise(req, requests);

        return requestClass.exec(req, res, next);
      } else if (user.triggers === maxRequests && !expired) {
        const remaining = expiration - now;

        throw {
          remaining,
          code: 429,
          message: [
            `Maximum requests for this request has been reached (${maxRequests}/${cooldown}s).`,
            `Please wait for ${remaining / 1000} seconds.`,
          ],
        };
      }
      this._update(req, requests);

      requestClass.exec(req, res, next);
    } catch (err) { this.util.handleApiError(res, err); }
  }

  protected _getMethod (req: Request): string {
    const request: string = req.params.request;
    const methods = this.server.api.keys();

    for (const method of methods) {
      const key = this.server.api.get(method).findKey((_, _key) => _key === request);

      if (key) return method;
    }

    return null;
  }

  protected _initialise (req: Request, requests: Collection<string, IRateLimitLog>) {
    const request: string = req.params.request;
    const ip = req.ip;
    requests.set(ip, { address: ip, triggers: 1, timestamp: Date.now() });

    const user = requests.get(ip);
    this.util.logger.status(
      `[I/RI] API: User: ${user.address} | request: ${this._getMethod(req)}->${request} | Triggers: ${user.triggers}`,
    );

    return user;
  }

  protected _update (req: Request, requests: Collection<string, IRateLimitLog>): void {
    const ip = req.ip;
    let user = requests.get(ip);
    const request: string = req.params.request;
    requests.set(ip, { address: ip, triggers: user.triggers + 1, timestamp: user.timestamp });

    user = requests.get(ip);
    this.util.logger.status(
      `[U] API: User: ${user.address} | request: ${this._getMethod(req)}->${request} | Triggers: ${user.triggers}`,
    );
  }

  protected _setHeaders (res: Response, user: IRateLimitLog, maxRequests: number, expiration: number) {
    res
      .header('X-RateLimit-Limit', String(maxRequests))
      .header('X-RateLimit-Remaining', String(maxRequests - user.triggers))
      .header('X-RateLimit-Reset', String(expiration));
  }
}
