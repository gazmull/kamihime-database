import { Response } from 'express';
import Route from '../../struct/Route';

export default class AdminRoute extends Route {
  constructor () {
    super({
      auth: 'admin',
      id: 'admin',
      method: 'all',
      route: [ '/admin/:action?' ],
    });
  }

  public exec (_, res: Response) {
    res.render('admin/dashboard');
  }
}
