import { Request, Response } from 'express';
import Api from '../../struct/Api';

/**
 * @api {get} /random/:length random
 * @apiName GetRandom
 * @apiGroup Kamihime Specific
 * @apiDescription Randomly provides character objects based on length provided. Maximum of 10.
 *
 * @apiParam {number} length Number of items to be provided.
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
export default class GetRandomRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 3,
      method: 'GET',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    try {
      const length = req.params[0] ? Math.abs(Number(req.params[0])) : 1;

      if (isNaN(length)) throw { code: 403, message: 'Only numbers are allowed.' };
      if (length > 10) throw { code: 403, message: 'Request must be only up to 10 characters.' };

      const roster = this.server.kamihime.filter(k => k.approved && k.avatar);
      const cherry = (number: number) => Math.abs(Math.floor(Math.random() * roster.length) - 1);
      const arr = Array(length) as IKamihime[];

      for (let i = 0; i < arr.length;) arr[i] = roster[cherry(i++)];

      res
        .status(200)
        .json(arr);
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
