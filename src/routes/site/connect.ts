import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Route from '../../struct/Route';
import ApiError from '../../util/ApiError';
import { URL } from 'url';

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

    const slug = this.server.stores.states.get(state as string);

    if (!slug) throw new ApiError(408, 'You took too long to log in? Shame!');

    const { url: slugURL } = slug;

    this.server.stores.states.delete(state as string);
    res.clearCookie('slug');

    const discord = this.server.auth.discord;

    const tokenURL = new URL('oauth2/token', discord.endpoint);
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: this.server.auth.urls.root + discord.callback,
      scope: 'identify'
    });
    tokenURL.username = discord.key;
    tokenURL.password = discord.secret;

    const response: any = await(await fetch(tokenURL.toString(), {
      body: params,
      headers: {
        Accept: 'application/json'
      },
      method: 'POST'
    })).json();

    if (response.errors) throw new ApiError(500, `[${response.code}] ${response.message}`);

    const user: any = await(await fetch(discord.endpoint + 'users/@me', {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + response.access_token
      }
    })).json();

    const settings = JSON.stringify({
      audio: req.cookies.settings.audio || {
        bgm: 0.1,
        glo: 1.0,
        snd: 0.5
      },
      menu: req.cookies.settings.menu || true,
      updatedAt: req.cookies.settings.updatedAt || Date.now(),
      visual: req.cookies.settings.visual || {
        bg: '#fc9252',
        cl: '#ffffff',
        cls: '#be5e05',
        containDialog: true,
        autoDialog: false,
        name: user.username,
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
        maxAge: 31536e6,
        secure: this.server.production,
        signed: true
      })
      .redirect(slugURL || '/');
  }
}
