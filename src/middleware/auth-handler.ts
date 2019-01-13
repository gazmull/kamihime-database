import { RequestHandler } from 'express';
import Route from '../struct/Route';
import Server from '../struct/Server';

export default function authHandler (server: Server, file: Route): RequestHandler {
  return async (req, res, next) => {
    if (!file.auth || (file.auth === true && !req.cookies.userId)) return next();
    if (file.auth === 'required' && !req.cookies.userId) return res.redirect('/login');

    const [ user ]: IUser[] = await server.util.db('users').select()
      .where('userId', req.cookies.userId);

    if (!user) {
      const msg = `${req.cookies.userId || req['auth-ip']}: Using invalid userId cookie; blocked.`;

      res.clearCookie('userId');
      server.util.handleSiteError(res, { code: 404, message: 'User not found; ID cookie cleared.' });

      return next(msg);
    }

    const { userId, username, lastLogin } = user;
    const eligible = Date.now() > (new Date(lastLogin).getTime() + 18e5);

    if (eligible)
      await this.util.db.raw(
        'UPDATE users SET lastLogin = now() WHERE userId = ?',
        [ req.cookies.userId ],
      );

    Object.assign(req, { 'auth-user': { userId, username } });
    const settings = JSON.parse(user.settings);
    const lastNav = req.cookies.lastNav || settings.lastNav;
    const infoLastNav = req.cookies['info-lastNav'] || settings['info-lastNav'];
    const menu = req.cookies.menu || settings.menu;

    res
      .cookie('userId', user.userId, { maxAge: 6048e5, httpOnly: true })
      .cookie('lastNav', lastNav)
      .cookie('info-lastNav', infoLastNav)
      .cookie('menu', menu)
      .cookie('audio', JSON.stringify(settings.audio))
      .cookie('visual', JSON.stringify(settings.visual));
  };
}
