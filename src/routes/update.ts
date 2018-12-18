import { Request, Response } from 'express';
import Route from '../struct/Route';

export default class DashboardRoute extends Route {
  constructor () {
    super({
      id: 'update',
      method: 'get',
      route: [ '/update' ],
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const { character: cId, id: sId, k: key } = req.query;

    try {
      if (!(cId || sId || key)) throw { code: 403, message: 'Incomplete query.' };

      const character = this.server.kamihimeCache.find(el => el.id === cId);
      const [ session ] = await this.server.util.db('sessions').select([ 'sID', 'sPW', 'sAge' ])
        .where('sID', sId);

      if (!session) throw { code: 404, message: 'Session not found.' };
      if (key !== session.sPW)
        throw { code: 403, message: 'Session key does not match with the session ID.' };

      const expired = (Date.now() - new Date(session.sAge).getTime()) >= 1000 * 60 * 30;

      if (expired) throw { code: 403, message: 'Session expired.' };

      const info = {
        avatar: character.avatar,
        harem1Resource1: character.harem1Resource1,
        harem1Title: character.harem1Title,
        harem2Resource1: character.harem2Resource1,
        harem2Resource2: character.harem2Resource2,
        harem2Title: character.harem2Title,
        harem3Resource1: character.harem3Resource1,
        harem3Resource2: character.harem3Resource2,
        harem3Title: character.harem3Title,
        id: character.id,
        name: character.name,
      };

      if (character.tier)
        Object.assign(info, { tier: character.tier });
      if (character.rarity)
        Object.assign(info, { rarity: character.rarity });
      if (character.element)
        Object.assign(info, { element: character.element });
      if (character.type)
        Object.assign(info, { type: character.type });

      res.render('update', { info, user: session });
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
