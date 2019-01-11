
import { NextFunction, Request, Response } from 'express';
// @ts-ignore
import { rootURL } from '../auth/auth';

export default function enforceSecured () {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.secure)
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
        res.redirect(301, 'https' + rootURL.slice(4) + req.originalUrl.slice(1));

    return next(`${req.ip || req.cookies.userId}: Using HTTP protocol; blocked.`);
  };
}
