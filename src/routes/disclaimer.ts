import { Response } from 'express';
import Route from '../struct/Route';

export default class DisclaimerRoute extends Route {
  constructor () {
    super({
      id: 'disclaimer',
      method: 'get',
      route: [ '/disclaimer' ],
    });
  }

  public async exec (_, res: Response): Promise<void> {
    try {
      res.render('invalids/disclaimer');
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
