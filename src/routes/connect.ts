import * as cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Route from '../struct/Route';

export default class ConnectRoute extends Route {
  constructor () {
    super({
      id: 'connect',
      method: 'get',
      route: [ '/connect' ]
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    try {
      const code = req.query.code;
      const state = req.query.state;

      if (!code) throw { code: 403, message: 'Auth code is missing.' };

      const [ match ] = await this.server.util.db('users').select('slug')
        .where('slug', state)
        .limit(1);

      if (!match) throw { code: 403, message: 'Invalid state ID.' };

      const discord = this.server.auth.grant.discord;
      const credentials = Buffer.from(`${discord.key}:${discord.secret}`).toString('base64');
      const url = [
        'https://discordapp.com/api/oauth2/token?',
        'grant_type=authorization_code',
        '&code=' + code,
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
      const user = await _user.json();

      await this.server.util.db.raw([
        'UPDATE users SET',
        'expiration=date_add(now(), interval 7 DAY),',
        `refreshToken='${response.refresh_token}',`,
        `settings='${JSON.stringify({
          audio: cookieParser.JSONCookie(req.cookies.audio) || {
            bgm: 0.1,
            global: 1.0,
            snd: 0.5
          },
          'info-lastNav': req.cookies['info-lastNav'] || '#info',
          lastNav: req.cookies.lastNav || '#all',
          menu: req.cookies.menu || true,
          visual: cookieParser.JSONCookie(req.cookies.visual) || {
            bg: 'rgb(255, 183, 183)',
            cl: 'rgb(190, 50, 74)'
          }
        })}',`,
        `userId='${user.id}',`,
        `username='${user.username}'`,
        `WHERE slug='${state}'`
        ].join(' ')
      );

      res.redirect('/');
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
