
import { NextFunction, Request, Response } from 'express';
// @ts-ignore
import { rootURL } from '../auth/auth';
import { handleApiError } from '../util/handleError';

export default function enforceSecured () {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.secure && process.env.NODE_ENV === 'production')
      if (
        req.method !== 'GET' ||
        (req.method === 'GET' && (req.body.token || req.headers.authorization || req.headers['proxy-authorization']))
      )
        handleApiError(res, { code: 403, message: 'Please use https protocol instead.' });
      else
        res.redirect(301, rootURL + req.originalUrl.slice(1));

    next();
  };
}
