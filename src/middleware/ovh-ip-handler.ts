import { RequestHandler } from 'express';

export default function ovhIpHandler (): RequestHandler {
  return (req, res, next) => {
    // See: https://docs.ovh.com/fr/ssl-gateway/utiliser-le-ssl-gateway/
    const ip = process.env.NODE_ENV === 'production'
      ? req.headers['X-Remote-Ip'] || req.headers['X-Forwarded-For']
      : req.ip;

    if (!ip) {
      res
        .status(403)
        .json({ error:
          { code: 403, message: 'You should not be accessing me directly! Or you should refresh your cache.' },
        });

      const id = req.cookies ? req.cookies.userId || ip : ip;

      return next(`${id}: Accessing me directly; blocked.`);
    }

    Object.assign(req, { 'auth-ip': ip });

    next();
  };
}
