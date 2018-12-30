import { Request, Response } from 'express';
import Api from '../../struct/Api';

/**
 * @api {get} /id/:id id
 * @apiVersion 2.1.0
 * @apiName GetId
 * @apiGroup Kamihime Specific
 * @apiDescription Retrieves an item's information.
 *
 * @apiParam {string} id The item's ID.
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
export default class GetIdRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 3,
      method: 'GET',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const id: any = req.params[0];
    const validId: string[] = [ 's', 'k', 'e', 'w', 'x' ];
    const checkId: boolean = id && validId.includes(id.charAt(0)) && !isNaN(id.slice(1));

    try {
      if (!checkId) throw { code: 403, message: 'Invalid id.' };

      const character: IKamihime = this.server.kamihimeCache.find(el => el.id === id.toLowerCase());

      if (!character) throw { code: 404, message: 'Character not found.' };

      res
        .status(200)
        .json(character);
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
