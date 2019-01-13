import { Request, Response } from 'express';
import Route from '../struct/Route';

export default class LogoutRoute extends Route {
  constructor () {
    super({
      auth: true,
      id: 'logout',
      method: 'get',
      route: [ '/logout' ],
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    try {
      if (!req['auth-user']) throw { code: 401 };

      res.clearCookie('userId');
      res.redirect(req.headers.referer || '/');
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
