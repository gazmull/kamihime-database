import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Route from '../struct/Route';

export default class RedirectRoute extends Route {
  constructor () {
    super({
      id: 'redirect',
      method: 'post',
      route: [ '/redirect' ],
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      const form = await fetch(this.server.auth.rootURL + 'api/update', {
        body: JSON.stringify(data),
        compress: true,
        headers: { Accept: 'application/json' },
        method: 'POST',
      });
      const { id, name, avatar } = await form.json();

      res.render('redirect', { id, name, avatar });
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
