import { Response } from 'express';
import { IKamihime } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';

const fields = [ 'id', 'name' ];

/**
 * @api {get} /id/:id latest
 * @apiName GetLatest
 * @apiGroup Kamihime Specific
 * @apiDescription Retrieves latest added characters up to 3 each category.
 *
 * @apiSuccess {Character[]} category Properties for each category (soul, eidolon, etc).
 * @apiSuccess {object} Character The character object.
 * @apiSuccess {string} Character.id The character ID.
 * @apiSuccess {string} Character.name The character name.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "soul": [
 *      { "id": "s0030", "name": "Shingen" },
 *      { "id": "s0029", "name": "Masamune (Soul)" },
 *      { "id": "s0028", "name": "Yukimura" }
 *    ],
 *    "eidolon": [
 *      { "id": "e5017", "name": "Hanuman" },
 *      { "id": "e6049", "name": "Medjed" },
 *      { "id": "e6042", "name": "Iwanaga-Hime" }
 *    ],
 *    "ssr+": [
 *      { "id": "k5082", "name": "Acala (Awakened)" },
 *      { "id": "k5080", "name": "Brahma (Awakened)" },
 *      { "id": "k5076", "name": "Odin (Awakened)" }
 *    ],
 *    "ssr": [
 *      { "id": "k5087", "name": "Isis" },
 *      { "id": "k5086", "name": "Tishtrya" },
 *      { "id": "k5081", "name": "Samael" }
 *    ],
 *    "sr": [
 *      { "id": "k6097", "name": "Hathor" },
 *      { "id": "k6096", "name": "Mithra" },
 *      { "id": "k6091", "name": "Cernunnos" }
 *    ],
 *    "r": [
 *      { "id": "k7055", "name": "Mato" },
 *      { "id": "k7054", "name": "(Holy Night Wind) Kamadeva" },
 *      { "id": "k7053", "name": "Dark Kushinada" }
 *    ]
 *  }
 */
export default class GetLatestRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'latest',
      max: 1,
      method: 'GET',
      route: [ '/latest' ]
    });
  }

  public async exec (_, res: Response) {
    const soul: IKamihime[] = await this.util.db('kamihime').select(fields)
      .whereRaw('id LIKE \'s%\' AND approved=1')
      .orderBy('_rowId', 'desc')
      .limit(3);
    const eidolon: IKamihime[] = await this.util.db('kamihime').select(fields)
      .whereRaw('id LIKE \'e%\' AND approved=1')
      .orderBy('_rowId', 'desc')
      .limit(3);
    const ssra: IKamihime[] = await this.util.db('kamihime').select(fields)
      .whereRaw('id LIKE \'k%\' AND rarity=\'SSR+\' AND approved=1')
      .orderBy('_rowId', 'desc')
      .limit(3);
    const ssr: IKamihime[] = await this.util.db('kamihime').select(fields)
      .whereRaw('id LIKE \'k%\' AND rarity=\'SSR\' AND approved=1')
      .orderBy('_rowId', 'desc')
      .limit(3);
    const sr: IKamihime[] = await this.util.db('kamihime').select(fields)
      .whereRaw('id LIKE \'k%\' AND rarity=\'SR\' AND approved=1')
      .orderBy('_rowId', 'desc')
      .limit(3);
    const r: IKamihime[] = await this.util.db('kamihime').select(fields)
      .whereRaw('id LIKE \'k%\' AND rarity=\'R\' AND approved=1')
      .orderBy('_rowId', 'desc')
      .limit(3);

    res
      .status(200)
      .json({ soul, eidolon, 'ssr+': ssra, ssr, sr, r });
  }
}
