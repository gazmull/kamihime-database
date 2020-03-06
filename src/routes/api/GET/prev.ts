import { Request, Response } from 'express';
import { IKamihime } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

/**
 * @api {get} /prev prev
 * @apiName GetPrev
 * @apiGroup Site Specific
 * @apiDescription Gets scenario preview for an episode
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    url: "https://example.com"
 *  }
 */
export default class GetPrevRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'prev',
      max: 4,
      method: 'GET',
      route: [ '/prev/:id/:ep' ]
    });
  }

  public async exec (req: Request, res: Response) {
    if (!res.locals.user || !(res.locals.user.donor || res.locals.user.hero)) throw new ApiError(403);

    const id: string = req.params.id;
    const ep: number = parseInt(req.params.ep);

    if (!id || !ep) throw new ApiError(400, 'ID and Episode is required.');
    if (![ 2, 3 ].includes(ep)) throw new ApiError(422, 'Not a valid episode.');

    const epKey = `harem${ep}resource2`;
    const [ character ]: IKamihime[] = await this.server.util.db('kamihime')
      .select([ 'id', 'name', 'rarity', epKey ])
      .where('id', id);

    if (!character) throw new ApiError(404);
    if (ep === 3 && (id.charAt(0) !== 'k' || [ 'SSR+', 'R' ].includes(character.rarity)))
      throw new ApiError(422, 'Invalid episode for this character.');
    if (!character[epKey])
      throw new ApiError(501, [ 'Episode Resource is empty.', 'Please contact the administrator!' ]);

    const url = `${this.server.auth.urls.h}scenarios/${id}/${character[epKey]}/${id.slice(1)}-${ep}-2_a.jpg`;

    return res
      .status(200)
      .json({ url });
  }
}
