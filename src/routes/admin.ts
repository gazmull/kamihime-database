import { Response } from 'express';
import Route from '../struct/Route';

export default class AdminRoute extends Route {
  constructor () {
    super({
      auth: 'admin',
      id: 'admin',
      method: 'all',
      route: [ '/admin/:action?' ],
    });
  }

  public exec (_, res: Response): void {
    try {
      res.render('admin/dashboard');
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
