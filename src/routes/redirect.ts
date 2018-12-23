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
    data.token = this.server.auth.api.token;

    try {
      const form = await fetch(this.server.auth.rootURL + 'api/update', {
        body: JSON.stringify(data),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const { id, name, avatar, error } = await form.json();

      if (error) throw error;

      res.render('redirect', { id, name, avatar });
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
