import { RequestHandler } from 'express';

export default function ovhIpHandler (): RequestHandler {
  return (req, res, next) => {
    // See: https://docs.ovh.com/fr/ssl-gateway/utiliser-le-ssl-gateway/
    const forwarded = req.headers['X-Forwarded-For'];
    const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const isProxy = [ '213\.32\.4\.\d{1,3}', '54\.39\.240\.\d{1,3}', '144\.217\.9\.\d{1,3}' ]
      .some(el => new RegExp(el).test(req.ip));
    const ip = process.env.NODE_ENV === 'production'
      ? req.headers['X-Remote-Ip'] || forwardedIp
      : req.ip;

    console.log(forwarded, ip, req.ip); // tslint:disable-line

    if (isProxy) return next();
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
