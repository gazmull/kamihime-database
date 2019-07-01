import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Route from '../../struct/Route';
import ApiError from '../../util/ApiError';

export default class ConnectRoute extends Route {
  constructor () {
    super({
      id: 'connect',
      method: 'get',
      route: [ '/connect' ]
    });
  }

  public async exec (req: Request, res: Response) {
    if (req.signedCookies.userId) throw new ApiError(403);

    const code = req.query.code;
    const state = req.query.state;

    if (!code) throw new ApiError(401, 'Auth code is missing.');

    const match = state === req.signedCookies.slug;

    if (!match) throw new ApiError(422, 'Invalid state ID.');

    const slug = this.server.stores.states.get(state);

    if (!slug) throw new ApiError(408, 'You took too long to log in? Shame!');

    const { url: slugURL } = slug;

    this.server.stores.states.delete(state);
    res.clearCookie('slug');

    const discord = this.server.auth.discord;
    const credentials = Buffer.from(`${discord.key}:${discord.secret}`).toString('base64');
    const url = [
      'https://discordapp.com/api/oauth2/token?',
      'grant_type=authorization_code',
      '&code=' + code,
      `&redirect_uri=${this.server.auth.rootURL + discord.callback}`,
      '&scope=identify',
    ].join('');

    const _response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: 'Basic ' + credentials
      },
      method: 'POST'
    });
    const response = await _response.json();

    const _user = await fetch('https://discordapp.com/api/users/@me', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + response.access_token
      }
    });
    const user = await _user.json();
    const settings = JSON.stringify({
      audio: req.cookies.settings.audio || {
        bgm: 0.1,
        glo: 1.0,
        snd: 0.5
      },
      menu: req.cookies.settings.menu || true,
      updatedAt: req.cookies.settings.updatedAt || Date.now(),
      visual: req.cookies.settings.visual || {
        bg: '#997777',
        cl: '#ffffff',
        cls: '#dd55ff',
        containDialog: true,
        autoDialog: false,
        fontSize: 18
      }
    });

    await this.server.util.db.raw([
      'INSERT INTO users',
      '(settings, userId, username)',
      'VALUES (:settings, :userId, :username)',
      'ON DUPLICATE KEY UPDATE',
      'username=:username',
      ].join(' '), {
        settings,
        userId: user.id,
        username: user.username
      }
    );

    res
      .cookie('userId', user.id, {
        httpOnly: true,
        maxAge: 6048e5,
        secure: this.server.production,
        signed: true
      })
      .redirect(slugURL || '/');
  }
}
