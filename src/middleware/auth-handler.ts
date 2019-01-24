import { RequestHandler } from 'express';

export default function authHandler (util: IUtil): RequestHandler {
  return async (req, res, next) => {
    if (!req.signedCookies.userId) {
      const cookies = req.cookies;

      if (!cookies.lastNav) res.cookie('lastNav', '#all');
      if (!cookies.menu) res.cookie('menu', 'true');
      if (!cookies['info-lastNav']) res.cookie('info-lastNav', '#info');
      if (!cookies.audio) res.cookie('audio', JSON.stringify({ bgm: 0.1, glo: 1.0, snd: 0.5 }));
      if (!cookies.visual) res.cookie('visual', JSON.stringify({
        bg: '#997777',
        cl: '#ffffff',
        cls: '#dd55ff',
        containDialog: true,
        fontSize: 18,
      }));

      return next();
    }

    const [ user ]: IUser[] = await util.db('users').select()
      .where('userId', req.signedCookies.userId);

    if (!user) {
      const msg = `${req.signedCookies.userId}: Using invalid userId cookie; blocked.`;

      res.clearCookie('userId');
      util.handleSiteError(res, { code: 404, message: 'User not found; ID cookie cleared.' });

      return next(msg);
    }

    const { userId, username, lastLogin } = user;
    res.locals.user = { lastLogin, userId, username };

    if (req.signedCookies.slug) {
      const [ admin ]: IAdminUser[] = await util.db('admin').select([ 'username', 'ip', 'lastLogin' ])
        .where({
          userId,
          slug: req.signedCookies.slug,
        });

      if (admin) {
        const toPass = {
          admin: true,
          ip: admin.ip,
          lastLogin: admin.lastLogin,
          username: admin.username,
        };

        Object.assign(res.locals.user, toPass);
      }
    }

    const eligible = Date.now() > (new Date(lastLogin).getTime() + 18e5);

    if (eligible)
      await util.db.raw(
        'UPDATE users SET lastLogin = now() WHERE userId = ?',
        [ req.signedCookies.userId ],
      );

    const settings = JSON.parse(user.settings);
    const lastNav = req.cookies.lastNav || settings.lastNav;
    const infoLastNav = req.cookies['info-lastNav'] || settings['info-lastNav'];
    const menu = req.cookies.menu || settings.menu;
    const production = process.env.NODE_ENV === 'production';

    res
      .cookie('userId', user.userId, { maxAge: 6048e5, httpOnly: true, secure: production, signed: true })
      .cookie('isUser', 'true', { maxAge: 6048e5 })
      .cookie('lastNav', lastNav)
      .cookie('info-lastNav', infoLastNav)
      .cookie('menu', menu)
      .cookie('audio', JSON.stringify(settings.audio))
      .cookie('visual', JSON.stringify(settings.visual));

    next();
  };
}
