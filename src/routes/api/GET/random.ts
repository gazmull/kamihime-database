import { Request, Response } from 'express';
import { IKamihime } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

/**
 * @api {get} /random/:length/:includeAll random
 * @apiName GetRandom
 * @apiGroup Kamihime Specific
 * @apiDescription Randomly provides character objects based on length provided. Maximum of 10.
 *
 * @apiParam {number} length Number of items to be provided.
 * @apiParam {boolean} includeAll Whether to include weapons and generic eidolons in the cherry picking pool as well
 *
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  [
 *    {
 *      "_rowId": 6,
 *      "id": "k0001",
 *      "name": "Satan",
 *      "approved": 1,
 *      "avatar": "portrait/Satan Portrait.png",
 *      "main": "main/Satan.png",
 *      "preview": "close/Satan Close.png",
 *      "loli": 0,
 *      "peeks": "6670",
 *      "harem1Title": "Satan and the Little Ones",
 *      "harem1Resource1": null,
 *      "harem2Title": "A Healthy Appetite",
 *      "harem2Resource1": null,
 *      "harem2Resource2": "aebdeb68bd5da8f168ae45e6a305c1d59531c0de755dde59",
 *      "harem3Title": "The Men's Revenge",
 *      "harem3Resource1": null,
 *      "harem3Resource2": "aebdeb68bd5da8f1d14add7fe21120889531c0de755dde59",
 *      "element": "Dark",
 *      "type": "Tricky",
 *      "rarity": "SSR",
 *      "tier": null
 *    }, ...items
 *  ]
 */
export default class GetRandomRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'random',
      max: 3,
      method: 'GET',
      route: [ '/random/:_length?/:includeAll?' ]
    });
  }

  public async exec (req: Request, res: Response) {
    const length = req.params._length ? Math.abs(Number(req.params._length)) : 1;
    const includeAll = req.params.includeAll;

    if (isNaN(length)) throw new ApiError(422, 'Only numbers are allowed.');
    if (length > 10) throw new ApiError(422, 'Request must be only up to 10 characters.');

    const filter = (k: IKamihime) => includeAll
      ? k.avatar
      : k.avatar && k.approved;

    const roster = this.server.kamihime.filter(filter);
    const cherry = () => Math.abs(Math.floor(Math.random() * roster.length) - 1);
    const arr = Array(length) as IKamihime[];

    for (let i = 0; i < arr.length; i++) arr[i] = roster[cherry()];

    res
      .status(200)
      .json(arr);
  }
}
