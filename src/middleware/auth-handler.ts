import { TextChannel } from 'discord.js';
import { RequestHandler } from 'express';
import { IAdminUser, IUser } from '../../typings';
import Server from '../struct/server';

const defaultSettings = {
  audio: { bgm: 0.1, glo: 1.0, snd: 0.5 },
  menu: 'true',
  visual: {
    bg: '#fc9252',
    cl: '#ffffff',
    cls: '#be5e05',
    containDialog: true,
    autoDialog: false,
    name: 'Master',
    fontSize: 18
  }
};

export default function authHandler (this: Server): RequestHandler {
  return async (req, res, next) => {
    if (!req.signedCookies.userId) {
      if (!req.cookies.settings) res.cookie('settings', defaultSettings);

      return next();
    }

    const [ user ]: IUser[] = await this.util.db('users').select()
      .where('userId', req.signedCookies.userId);

    if (!user) {
      const msg = `${req.signedCookies.userId}: Using invalid userId cookie; blocked.`;

      res.clearCookie('userId');
      this.util.handleSiteError.call(this, res, { code: 404, message: 'User not found; ID cookie cleared.' });

      return next(msg);
    }

    const { userId, username, lastLogin } = user;
    res.locals.user = { lastLogin, userId, username };

    let isDonor: boolean;

    try {
      const fetchedDiscord = await this.client.discord.users.fetch(req.signedCookies.userId);
      const channel = await this.client.discord.channels.fetch(this.client.auth.discord.channel) as TextChannel;
      const guild = channel ? channel.guild : null;
      const guildMember = guild ? await guild.members.fetch(fetchedDiscord.id) : null;
      isDonor = fetchedDiscord && guild && guildMember &&
        guildMember.roles.cache.has(this.client.auth.discord.donorID);
    } catch { isDonor = false; }

    if (isDonor) Object.assign(res.locals.user, { donor: true });
    if (this.stores.heroes.has(req.signedCookies.userId)) Object.assign(res.locals.user, { hero: true });
    if (req.signedCookies.slug) {
      const [ admin ]: IAdminUser[] = await this.util.db('admin').select([ 'username', 'ip', 'lastLogin' ])
        .where({
          userId,
          slug: req.signedCookies.slug
        });

      if (admin) {
        const toPass = {
          admin: true,
          ip: req.cookies.ip,
          lastLogin: req.cookies.lastLogin,
          username: admin.username
        };

        Object.assign(res.locals.user, toPass);
      }
    }

    const eligible = Date.now() > (new Date(lastLogin).getTime() + 18e5);

    if (eligible)
      await this.util.db.raw(
        'UPDATE users SET lastLogin = now() WHERE userId = ?',
        [ req.signedCookies.userId ]
      );

    let settings = JSON.parse(user.settings);
    const production = process.env.NODE_ENV === 'production';
    const hasUpdatedAt = req.cookies.settings && req.cookies.settings.updatedAt;

    if (hasUpdatedAt && settings.updatedAt < req.cookies.settings.updatedAt) {
      settings = req.cookies.settings;

      await this.util.db('users').where('userId', user.userId)
        .update('settings', JSON.stringify(req.cookies.settings));
    }

    res
      .cookie('userId', user.userId, { maxAge: 31536e6, httpOnly: true, secure: production, signed: true })
      .cookie('isUser', 'true', { maxAge: 31536e6 })
      .cookie('settings', settings);

    next();
  };
}
