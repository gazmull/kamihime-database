import { Collection } from 'discord.js';
import { Request, RequestHandler, Response } from 'express';
import { IRateLimitLog } from '../../typings';
import ApiRoute from '../struct/ApiRoute';
import Server from '../struct/server';
import ApiError from '../util/ApiError';

export default function apiHandler (this: Server, file: ApiRoute): RequestHandler {
  const _initialise = (req: Request, requests: Collection<string, IRateLimitLog>) => {
    const ip = req.ip;
    requests.set(ip, { address: ip, triggers: 1, timestamp: Date.now() });

    const user = requests.get(ip);
    this.util.logger.info(
      `[I/RI] API: User: ${user.address} | request: ${file.method}->${file.id} | Triggers: ${user.triggers}`
    );

    return user;
  };

  const _update = (req: Request, requests: Collection<string, IRateLimitLog>) => {
    const ip = req.ip;
    let user = requests.get(ip);
    requests.set(ip, { address: ip, triggers: user.triggers + 1, timestamp: user.timestamp });

    user = requests.get(ip);
    this.util.logger.info(
      `[U] API: User: ${user.address} | request: ${file.method}->${file.id} | Triggers: ${user.triggers}`
    );
  };

  const _setHeaders = (res: Response, user: IRateLimitLog, maxRequests: number, expiration: number) => {
    res
      .header('X-RateLimit-Limit', String(maxRequests))
      .header('X-RateLimit-Remaining', String(maxRequests - user.triggers))
      .header('X-RateLimit-Reset', String(expiration));
  };

  return async (req, res, next) => {
    try {
      const ip = req.ip;

      if (
        ip.includes(this.auth.host.address) ||
        (req.signedCookies.userId && this.auth.exempt.includes(req.signedCookies.userId))
      ) return next();

      const requests = this.stores.rateLimits.get(file.method).get(file.id);
      let user = requests.find(r => r.address === ip);

      if (!user) {
        user = _initialise(req, requests);

        _setHeaders(res, user, file.max, user.timestamp + (file.cooldown * 1000));

        return next();
      }

      const { cooldown, max: maxRequests } = file;
      const now = Date.now();
      const expiration = user.timestamp + (cooldown * 1000);
      const expired = now > expiration;

      _setHeaders(res, user, maxRequests, expiration);

      if (expired) {
        _initialise(req, requests);

        return next();
      } else if (user.triggers === maxRequests && !expired) {
        const remaining = expiration - now;

        throw new ApiError(
          429,
          [
            `Maximum requests has been reached (${maxRequests}/${cooldown}s).`,
            `Please wait for ${remaining / 1000} seconds.`,
          ]
        )
          .setRemaining(remaining);
      }
      _update(req, requests);

      return next();
    } catch (err) { this.util.handleApiError.call(this, res, err); }
  };
}
