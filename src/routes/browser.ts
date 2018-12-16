import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Route from '../struct/Route';

export default class BrowserRoute extends Route {
  constructor () {
    super({
      id: 'browser',
      method: 'get',
      route: [ '/' ]
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const endPoint = this.server.auth.rootURL + 'api/';

    try {
      let data = await fetch(endPoint + 'list/approved');
      let characters: any[] = await data.json();
      let hot = characters.slice();
      hot = hot.sort((a, b) => b.peeks - a.peeks).slice(0, 10);
      characters = characters
        .filter(el => el.harem1Resource1)
        .map(el => ({ id: el.id, name: el.name, rarity: el.rarity }));

      data = await fetch(endPoint + 'latest');
      const latest = await data.json();

      const requested = { characters, latest, hot, user: {} };

      if (req.cookies.slug) {
        const [ user ] = await this.server.util.db('users').select([ 'settings', 'username' ])
          .where('slug', req.cookies.slug)
          .limit(1);

        Object.assign(requested, { user });
      }

      res.render('browser', requested);
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
