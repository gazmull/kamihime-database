import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Route from '../struct/Route';

export default class BrowserRoute extends Route {
  constructor () {
    super({
      id: 'browser',
      method: 'get',
      route: [ '/' ],
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const endPoint = this.server.auth.rootURL + 'api/';

    try {
      const hot: IKamihime[] = await this.util.db('kamihime').select([ 'id', 'name', 'rarity', 'peeks' ])
        .where('approved', 1)
        .orderBy('peeks', 'desc')
        .limit(10);
      const characters = this.server.kamihime
        .filter(el => el.approved)
        .map(el => ({ id: el.id, name: el.name, rarity: el.rarity }));

      const data = await fetch(endPoint + 'latest', { headers: { Accept: 'application/json' } });
      const latest = await data.json();
      const status = this.server.status;
      const requested = { characters, latest, hot, status };

      res.render('browser/browser', requested);
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
