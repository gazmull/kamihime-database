import { Request, Response } from 'express';
import { IKamihime } from '../../../typings';
import Route from '../../struct/Route';
import ApiError from '../../util/ApiError';

export default class InfoRoute extends Route {
  constructor () {
    super({
      id: 'info',
      method: 'get',
      route: [ '/info/:id' ]
    });
  }

  public async exec (req: Request, res: Response) {
    const { id = null }: { id: string } = req.params;

    if (!id) throw new ApiError(422, 'ID is empty.');
    if (!/[resk]/.test(id.charAt(0)))
      throw new ApiError(422, 'Only souls, eidolons, and kamihime characters are allowed.');

    const character = id === 'random'
      ? await this._getRandom()
      : this.server.kamihime
        .filter(el => /[esk]/.test(el.id.charAt(0)))
        .find(el => el.id === id);

    if (!character) throw new ApiError(422);
    else if ((character as any).error) throw new ApiError(404);

    res.render('info/info', { character });
  }

  // -- Util

  protected _getRandom () {
    return fetch(this.server.auth.api.url + 'random', { headers: { Accept: 'application/json' } })
      .then(res => res.json() as Promise<IKamihime>);
  }
}
