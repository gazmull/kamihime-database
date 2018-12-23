import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Route from '../struct/Route';

export default class ConnectRoute extends Route {
  constructor () {
    super({
      id: 'connect',
      method: 'get',
      route: [ '/connect' ],
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    try {
      if (req.cookies.userId) throw { code: 403 };

      const code = req.query.code;
      const state = req.query.state;

      if (!code) throw { code: 403, message: 'Auth code is missing.' };

      const match = state === req.cookies.slug;

      if (!match) throw { code: 403, message: 'Invalid state ID.' };

      res.clearCookie('slug');

      const discord = this.server.auth.discord;
      const credentials = Buffer.from(`${discord.key}:${discord.secret}`).toString('base64');
      const url = [
        'https://discordapp.com/api/oauth2/token?',
        'grant_type=authorization_code',
        '&code=' + code,
        '&redirect_uri=' + this.server.auth.rootURL + discord.callback,
        '&scope=identify',
      ].join('');

      const _response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          Authorization: 'Basic ' + credentials,
        },
        method: 'POST',
      });
      const response = await _response.json();

      const _user = await fetch('https://discordapp.com/api/users/@me', {
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + response.access_token,
        },
      });
      const user = await _user.json();
      const settings = JSON.stringify({
        audio: req.cookies.audio
          ? JSON.parse(req.cookies.audio)
          : {
          bgm: 0.1,
          glo: 1.0,
          snd: 0.5,
        },
        'info-lastNav': req.cookies['info-lastNav'] || '#info',
        lastNav: req.cookies.lastNav || '#all',
        menu: req.cookies.menu || true,
        visual: req.cookies.visual
          ? JSON.parse(req.cookies.visual)
          : {
          bg: 'rgb(255, 183, 183)',
          cl: 'rgb(190, 50, 74)',
        },
      });

      await this.util.db.raw([
        'INSERT INTO users',
        '(expiration, refreshToken, settings, userId, username)',
        'VALUES (date_add(now(), interval 7 DAY), :rT, :s, :uI, :uN)',
        'ON DUPLICATE KEY UPDATE',
        'expiration=date_add(now(), interval 7 DAY), refreshToken=:rT, username=:uN',
        ].join(' '), {
          rT: response.refresh_token,
          s: settings,
          uI: user.id,
          uN: user.username,
        },
      );

      res
        .cookie('userId', user.id, { maxAge: 6048e5 })
        .redirect('/');
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
