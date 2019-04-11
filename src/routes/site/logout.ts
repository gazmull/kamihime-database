import { Request, Response } from 'express';
import Route from '../../struct/Route';

export default class LogoutRoute extends Route {
  constructor () {
    super({
      auth: true,
      id: 'logout',
      method: 'get',
      route: [ '/logout' ]
    });
  }

  public async exec (req: Request, res: Response) {
    res
      .clearCookie('userId')
      .clearCookie('isUser');
    res.redirect(req.headers.referer || '/');
  }
}
