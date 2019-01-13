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

      const slug = this.server.states.get(state);

      if (!slug) throw { code: 408, message: 'You took too long to log in? Shame!' };

      const { url: slugURL } = slug;

      this.server.states.delete(state);
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
        audio: req.cookies.audio && Object.keys(JSON.parse(req.cookies.audio)).length
          ? JSON.parse(req.cookies.audio)
          : {
          bgm: 0.1,
          glo: 1.0,
          snd: 0.5,
        },
        'info-lastNav': req.cookies['info-lastNav'] || '#info',
        lastNav: req.cookies.lastNav || '#all',
        menu: req.cookies.menu || true,
        visual: req.cookies.visual && Object.keys(JSON.parse(req.cookies.visual)).length
          ? JSON.parse(req.cookies.visual)
          : {
          bg: '#997777',
          cl: '#ffffff',
          cls: '#dd55ff',
          containDialog: true,
          fontSize: 18,
        },
      });

      await this.util.db.raw([
        'INSERT INTO users',
        '(settings, userId, username)',
        'VALUES (:settings, :userId, :username)',
        'ON DUPLICATE KEY UPDATE',
        'username=:username',
        ].join(' '), {
          settings,
          userId: user.id,
          username: user.username,
        },
      );

      res
        .cookie('userId', user.id, { maxAge: 6048e5 })
        .redirect(slugURL || '/');
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
