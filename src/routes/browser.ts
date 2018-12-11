import { Response } from 'express';
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

  public async exec (_, res: Response): Promise<void> {
    const endPoint = this.server.auth.rootURL + 'api/';

    try {
      let data = await fetch(endPoint + 'list/approved');
      let characters: any[] = await data.json();
      let hot = characters.slice();
      hot = hot.sort((a, b) => b.peeks - a.peeks).slice(0, 10);
      characters = characters.map(el => ({ id: el.id, name: el.name, rarity: el.rarity }));

      data = await fetch(endPoint + 'latest');
      const latest = await data.json();

      res.render('browser', { characters, latest, hot });
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
