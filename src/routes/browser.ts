import anchorme from 'anchorme';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Route from '../struct/Route';

export default class BrowserRoute extends Route {
  constructor () {
    super({
      auth: true,
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

      const requested = { characters, latest, hot, user: {}, status: null };

      if (req.cookies.userId) {
        const [ user ]: IUser[] = await this.util.db('users').select([ 'settings', 'username', 'lastLogin' ])
          .where('userId', req.cookies.userId)
          .limit(1);

        if (user) {
          const eligible = (Date.now() - new Date(user.lastLogin).getTime()) > 18e5;

          if (eligible)
            await this.util.db.raw(
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

      const [ status ]: IStatus[] = await this.util.db('status').select('message')
        .orderBy('date', 'desc')
        .limit(1);

      if (status)
        Object.assign(
          requested, {
            status: anchorme(status.message, { attributes: [ { name: 'target', value: '_blank' } ] }),
          },
        );

      res.render('browser', requested);
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
