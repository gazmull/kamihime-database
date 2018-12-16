import { Request, Response } from 'express';
import * as shortid from 'shortid';
import Route from '../struct/Route';

shortid.seed(11);

export default class LoginRoute extends Route {
  constructor () {
    super({
      id: 'login',
      method: 'get',
      route: [ '/login' ]
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    try {
      if (req.cookies.slug) {
        const [ match ] = await this.server.util.db('users').select('slug')
          .where('slug', req.cookies.slug)
          .andWhereRaw('userId IS NOT NULL and username IS NOT NULL')
          .limit(1);

        if (match) throw { code: 403 };
      }

      const state = shortid.generate();
      res.cookie('slug', state, { maxAge: 6048e5 });

      await this.server.util.db.raw([
        'INSERT INTO users (slug) VALUES(:sl)',
        'ON DUPLICATE KEY UPDATE slug = :sl'
        ].join(' '), {
            sl: state
        }
      );

      res.redirect([
        'https://discordapp.com/oauth2/authorize?',
        'client_id=' + this.server.auth.grant.discord.key,
        '&response_type=code',
        '&redirect_uri=' + this.server.auth.rootURL + this.server.auth.grant.discord.callback,
        '&scope=identify',
        '&state=' + state
      ].join(''));
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
