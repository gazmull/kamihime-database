import { RequestHandler } from 'express';

export default function ovhIpHandler (): RequestHandler {
  return (req, res, next) => {
    // See: https://docs.ovh.com/fr/ssl-gateway/utiliser-le-ssl-gateway/
    const forwarded = req.headers['X-Forwarded-For'];
    const ip = process.env.NODE_ENV === 'production'
      ? req.headers['X-Remote-Ip'] || (Array.isArray(forwarded) ? forwarded[0] : forwarded)
      : req.ip;

    // @ts-ignore
    if ([ '213.32.4.0/24', '54.39.240.0/24', '144.217.9.0/24' ].includes(ip)) return next();

    if (!ip) {
      res
        .status(403)
        .json({ error:
          { code: 403, message: 'You should not be accessing me directly! Or you should refresh your cache.' },
        });

      const id = req.cookies ? req.cookies.userId || ip : ip;

      return next(`${id}: Accessing me directly; blocked.`);
    }

    Object.assign(req, { 'auth-ip': ip.slice(7) });

    next();
  };
}
