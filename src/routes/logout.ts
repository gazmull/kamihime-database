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
      if (!req.cookies.userId) throw { code: 401 };

      const val = req.query.id ? req.query.id : req.cookies.userId;
      const [ match ]: IUser[] = await this.util.db('users').select('userId')
        .where('userId', val)
        .limit(1);

      if (!match) throw { code: 403 };

      res.clearCookie('userId');

      res.redirect(req.headers.referer || '/');
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
