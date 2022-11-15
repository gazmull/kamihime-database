import { Response } from 'express';
import Route from '../../struct/Route';

export default class BrowseRoute extends Route {
  constructor () {
    super({
      id: 'browse',
      method: 'get',
      route: [ '/browse' ]
    });
  }

  public exec (_, res: Response) {
    const characters = this.server.kamihime
      .filter(el => el.approved)
      .map(el => ({ id: el.id, name: el.name, rarity: el.rarity, avatar: el.avatar, loli: el.loli }));

    res.render('browse/browse', { characters });
  }
}
