import { Request, Response } from 'express';
import * as shortid from 'shortid';
import Route from '../struct/Route';

shortid.seed(11);

export default class LoginRoute extends Route {
  constructor () {
    super({
      id: 'login',
      method: 'get',
      route: [ '/login' ],
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    try {
      if (req.cookies.userId) throw { code: 403 };

      const slug = shortid.generate();

      this.server.states.set(slug, { timestamp: Date.now(), url: req.headers.referer });

      // if (req.query.admin)
      //   return res.render('admin/login', { slug });

      res
        .cookie('slug', slug, { maxAge: 18e5, httpOnly: true })
        .redirect([
          'https://discordapp.com/oauth2/authorize?',
          'client_id=' + this.server.auth.discord.key,
          '&response_type=code',
          `&redirect_uri=${this.server.auth.rootURL + this.server.auth.discord.callback}`,
          '&scope=identify',
          '&state=' + slug,
        ].join(''));
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
