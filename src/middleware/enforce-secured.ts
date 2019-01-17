import { RequestHandler } from 'express';
// @ts-ignore
import { rootURL } from '../auth/auth';

export default function enforceSecured (): RequestHandler {
  return (req, res, next) => {
    if (!req.secure) {
      if (
        req.method !== 'GET' ||
        // ? - Future use
        (
          req.method === 'GET' &&
          (req.headers.authorization || req.headers['proxy-authorization'])
        )
      )
        res
          .status(403)
          .json({ error: { code: 403, message: 'Please use https protocol instead.' } });
      else
        res.redirect(301, `https${rootURL.slice(4) + req.originalUrl.slice(1)}`);

      const ip = req.ip;
      const id = req.cookies ? req.cookies.userId || ip : ip;

      return next(`${id}: Using HTTP protocol; blocked.`);
    }

    next();
  };
}
