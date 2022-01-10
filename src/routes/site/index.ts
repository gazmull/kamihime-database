import { Response } from 'express';
import fetch from 'node-fetch';
import { IKamihime } from '../../../typings';
import Route from '../../struct/Route';

export default class IndexRoute extends Route {
  constructor () {
    super({
      id: 'index',
      method: 'get',
      route: [ '/' ]
    });
  }

  public async exec (_, res: Response) {
    const endPoint = `http://localhost:${this.server.auth.host.port}/api/`;

    const hot: IKamihime[] = await this.server.util.db('kamihime')
      .select([ 'id', 'name', 'tier', 'rarity', 'peeks', 'avatar' ])
      .where('approved', 1)
      .orderBy('peeks', 'desc')
      .limit(10);
    const sols: IKamihime[] = await this.server.util.db('kamihime')
      .select([ 'id', 'name', 'tier', 'rarity', 'peeks', 'avatar' ])
      .where('approved', 1)
      .andWhere('name', 'rlike', '[[:<:]]sol[[:>:]]')
      .orderBy('name');

    const latestCreated = await fetch(endPoint + 'latest?len=10', { headers: { Accept: 'application/json' } })
      .then(res => res.json());
    const latestUpdated = await fetch(endPoint + 'latest?len=10&updatedat=true', { headers: { Accept: 'application/json' } })
      .then(res => res.json());
    const status = this.server.status;
    const requested = { latestCreated, latestUpdated, hot, status, sols };

    res.render('index', requested);
  }
}
