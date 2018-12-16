import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Api from '../../struct/Api';

export default class AtMeRoute extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 5,
      method: 'GET'
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    try {
      let [ user ] = await this.server.util.db('users').select()
        .where('slug', req.cookies.slug)
        .andWhereRaw('userId IS NOT NULL and username IS NOT NULL')
        .limit(1);

      if (!user) throw { code: 403 };

      const settings = JSON.parse(user.settings);
      const timeLapsed = Date.now() - new Date(user.expiration).getTime();
      const expired = timeLapsed > 604800;

      if (expired) {
        const discord = this.server.auth.grant.discord;
        const credentials = Buffer.from(`${discord.key}:${discord.secret}`).toString('base64');
        const url = [
          'https://discordapp.com/api/oauth2/token?',
          'grant_type=refresh_token',
          'refresh_token=' + user.refreshToken,
          '&redirect_uri=' + this.server.auth.rootURL + discord.callback,
          '&scope=identify'
        ].join('');

        const _response = await fetch(url, {
          headers: { Authorization: 'Basic ' + credentials },
          method: 'POST'
        });
        const response = await _response.json();

        const _user = await fetch('https://discordapp.com/api/users/@me', {
          headers: { Authorization: 'Bearer ' + response.access_token }
        });
        const newUser = await _user.json();
        user = newUser.username;

        await this.server.util.db.raw([
          'UPDATE users SET',
          'expiration=date_add(now(), interval 7 DAY),',
          `username='${user}'`,
          `WHERE slug='${req.cookies.slug}'`
        ].join(' '));
      } else user = user.username;

      if (req.query.save)
        await this.server.util.db.raw([
          'UPDATE users SET',
          `settings='${JSON.stringify({
            audio: req.cookies.audio
              ? JSON.parse(req.cookies.audio)
              : {
              bgm: 0.1,
              global: 1.0,
              snd: 0.5
            },
            'info-lastNav': req.cookies['info-lastNav'] || '#info',
            lastNav: req.cookies.lastNav || '#all',
            menu: req.cookies.menu || true,
            visual: req.cookies.visual
              ? JSON.parse(req.cookies.visual)
              : {
              bg: 'rgb(255, 183, 183)',
              cl: 'rgb(190, 50, 74)'
            }
          })}'`,
          `WHERE slug='${req.cookies.slug}'`
          ].join(' ')
        );

      res
        .json({ settings, username: user })
        .status(200);
    } catch (err) { this.server.util.handleApiError(res, err); }
  }
}
