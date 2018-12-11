import { Request, Response } from 'express';
import Route from '../struct/Route';
import fetch from 'node-fetch';

export default class RedirectRoute extends Route {
  constructor() {
    super({
      id: 'redirect',
      method: 'post',
      route: ['/redirect']
    });
  }

  async exec(req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      const form = await fetch(this.server.auth.rootURL + 'api/update', {
        method: 'POST',
        body: JSON.stringify(data),
        compress: true
      });
      const { id, name, avatar } = await form.json();

      res.render('redirect', { id, name, avatar });
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
