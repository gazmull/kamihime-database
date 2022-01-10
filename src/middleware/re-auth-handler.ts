import { RequestHandler } from 'express';
import Route from '../struct/Route';

export default function reAuthHandler (file: Route): RequestHandler {
  return async (req, res, next) => {
    const isAdminOrDonor = res.locals.user && (res.locals.user.admin || res.locals.user.donor || res.locals.user.hero);

    if (isAdminOrDonor) {
      if (file.auth === 'admin' && !res.locals.user.admin)
        return res.redirect('/login/admin');

      return next();
    }

    const isNotLoginOrAdmin = !/^\/(?:log(?:in|out)|connect|admin|donate)/.test(req.originalUrl);

    if (isNotLoginOrAdmin && (!res.locals.user || !res.locals.user.donor || !res.locals.user.hero))
      return res.render('invalids/shutdown', { redirected: true });

    if (file.auth && !res.locals.user)
      return res.redirect(`/login${file.auth === 'admin' ? '/admin' : ''}`);
    else if (file.auth === 'admin' && !res.locals.user.admin)
      return res.redirect('/login/admin');

    next();
  };
}
