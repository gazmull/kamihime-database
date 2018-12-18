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
      let data = await fetch(endPoint + 'list/approved', { headers: { Accept: 'application/json' } });
      let characters: any[] = await data.json();
      let hot = characters.slice();
      hot = hot.sort((a, b) => b.peeks - a.peeks).slice(0, 10);
      characters = characters
        .filter(el => el.harem1Resource1)
        .map(el => ({ id: el.id, name: el.name, rarity: el.rarity }));

      data = await fetch(endPoint + 'latest', { headers: { Accept: 'application/json' } });
      const latest = await data.json();

      const requested = { characters, latest, hot, user: {} };

      if (req.cookies.userId) {
        const [ user ] = await this.server.util.db('users').select([ 'settings', 'username', 'lastLogin' ])
          .where('userId', req.cookies.userId)
          .limit(1);

        if (user) {
          const eligible = (Date.now() - new Date(user.lastLogin).getTime()) > 18e5;

          if (eligible)
            await this.server.util.db.raw(
              'UPDATE users SET lastLogin = now() WHERE userId = ?',
              [ req.cookies.userId ],
            );

          Object.assign(requested, { user });
        }

        const settings = JSON.parse(user.settings);

        res
          .cookie('lastNav', settings.lastNav)
          .cookie('info-lastNav', settings['info-lastNav'])
          .cookie('menu', settings.menu)
          .cookie('audio', JSON.stringify(settings.audio))
          .cookie('visual', JSON.stringify(settings.visual));
      }

      res.render('browser', requested);
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
