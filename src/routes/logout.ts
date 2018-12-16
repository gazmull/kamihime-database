import { Request, Response } from 'express';
import Route from '../struct/Route';

export default class LogoutRoute extends Route {
  constructor () {
    super({
      id: 'logout',
      method: 'get',
      route: [ '/logout' ]
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    try {
      const id = req.query.id ? 'userId' : 'slug';
      const val = req.query.id ? req.query.id : req.cookies.slug;
      const [ match ] = await this.server.util.db('users').select(id)
        .where(id, val)
        .limit(1);

      if (!match) throw { code: 403 };

      await this.server.util.db('users').where(id, val)
        .delete();

      if (req.cookies.slug)
        res.clearCookie('slug');

      res.redirect('/');
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
