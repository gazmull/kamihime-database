import { Request, Response } from 'express';
import { IKamihime, IKamihimeLatest } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

/* tslint:disable:max-line-length */

/**
 * @api {get} /latest latest
 * @apiName GetLatest
 * @apiGroup Kamihime Specific
 * @apiDescription Retrieves latest added characters.
 *
 * @apiParam (Query) {string} [category] Get latest characters within the specified category only. Available: `soul` / `eidolon` / `ssr+` / `ssr` / `sr` / `r`
 * @apiParam (Query) {number} [len] The number of latest characters to be retrieved. Default: 3 / Min-Max: 1—10
 *
 * @apiSuccess {Character[]} category Properties for each category (soul, eidolon, etc).
 * @apiSuccess {object} Character The character object.
 * @apiSuccess {string} Character.id The character ID.
 * @apiSuccess {string} Character.name The character name.
 * @apiSuccess {string} Characer.created The character's data creation date.
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

 /* tslint:enable:max-line-length */
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

  public async exec (req: Request, res: Response) {
    const latestLength: number = req.query.len || 3;
    const category: string = req.query.category;

    if (latestLength <= 0 || latestLength > 10)
      throw new ApiError(422, 'Requested length should be between 1 and 10.');
    if (!category) {
      const categories: IKamihimeLatest = {
        soul: this.server.kamihime.filter(v => v.id.charAt(0) === 's' && v.approved),
        eidolon: this.server.kamihime.filter(v => v.id.charAt(0) === 'e' && v.approved),
        'ssr+': this.server.kamihime.filter(v => v.id.charAt(0) === 'k' && v.rarity === 'SSR+' && v.approved),
        ssr: this.server.kamihime.filter(v => v.id.charAt(0) === 'k' && v.rarity === 'SSR' && v.approved),
        sr: this.server.kamihime.filter(v => v.id.charAt(0) === 'k' && v.rarity === 'SR' && v.approved),
        r: this.server.kamihime.filter(v => v.id.charAt(0) === 'k' && v.rarity === 'R' && v.approved)
      };

      for (const key of Object.keys(categories)) {
        const _category = categories[key] as IKamihime[];

        categories[key] = _category
          .sort((a, b) => b._rowId - a._rowId)
          .map(v => ({ id: v.id, name: v.name, created: v.created }))
          .slice(0, latestLength);
      }

      return res
        .status(200)
        .json(categories);
    }

    let selected: string = null;

    switch (category) {
      default: throw new ApiError(422, 'Invalid category.');
      case 'ssr+':
      case 'ssr':
      case 'sr':
      case 'r':
        selected = 'k';
        break;
      case 'soul':
        selected = 's';
        break;
      case 'eidolon':
        selected = 'e';
        break;
    }

    const list = this.server.kamihime
      .filter(v =>
        v.id.charAt(0) === selected
        && (selected === 'k'
          ? v.rarity === category.toUpperCase()
          : true)
        && v.approved)
      .sort((a, b) => b._rowId - a._rowId)
      .map(v => ({ id: v.id, name: v.name, created: v.created }))
      .slice(0, latestLength);

    return res
      .status(200)
      .json({ [category]: list });
  }
}
