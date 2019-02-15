import { Response } from 'express';
import Api from '../../struct/Api';

/**
 * @api {get} /random random
 * @apiName GetRandom
 * @apiGroup Kamihime Specific
 * @apiDescription Randomly provides a character object.
 *
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "_rowId": 6,
 *    "id": "k0001",
 *    "name": "Satan",
 *    "approved": 1,
 *    "avatar": "portrait/Satan Portrait.png",
 *    "main": "main/Satan.png",
 *    "preview": "close/Satan Close.png",
 *    "loli": 0,
 *    "peeks": "6670",
 *    "harem1Title": "Satan and the Little Ones",
 *    "harem1Resource1": null,
 *    "harem2Title": "A Healthy Appetite",
 *    "harem2Resource1": null,
 *    "harem2Resource2": "aebdeb68bd5da8f168ae45e6a305c1d59531c0de755dde59",
 *    "harem3Title": "The Men's Revenge",
 *    "harem3Resource1": null,
 *    "harem3Resource2": "aebdeb68bd5da8f1d14add7fe21120889531c0de755dde59",
 *    "element": "Dark",
 *    "type": "Tricky",
 *    "rarity": "SSR",
 *    "tier": null
 *  }
 */
export default class GetRandomRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 3,
      method: 'GET',
    });
  }

  public async exec (_, res: Response): Promise<void> {
    try {
      const roster = this.server.kamihime.filter(k => k.approved && k.avatar);
      const cherry = Math.floor(Math.random() * roster.length);

      res
        .status(200)
        .json(roster[cherry]);
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
