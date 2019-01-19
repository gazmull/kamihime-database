import { RequestHandler } from 'express';
import Route from '../struct/Route';

export default function reAuthHandler (file: Route): RequestHandler {
  return async (req, res, next) => {
    if (file.auth && !res.locals.user) {
      res.redirect('/login');

      next('route');
    }

    next();
  };
}
