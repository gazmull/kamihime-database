import { Request, Response } from 'express';
import * as Fuse from 'fuse.js';
import { IKamihime } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

/**
 * @api {get} /search search
 * @apiName GetSearch
 * @apiGroup Kamihime Specific
 * @apiDescription Searches items with the provided name.
 *
 * @apiParam (Query) {string} name The item's name.
 * @apiParam (Query) {string} [class] Search `soul` / `eidolon` / `kamihime` / `weapon` only.
 * @apiParam (Query) {number} [accurate] `1 / 0 only`: Whether to immediately shift the search on the first result
 *  or not if the provided name is accurate enough to resolve at least one item.
 * @apiParam (Query) {number} [loli] `1 / 0 only`: Search `lolis` / `not lolis` only.
 * @apiParam (Query) {string} [element] Search `light` / `dark` / `wind` / `thunder` / `water` / `fire` / `phantom`
 *  only.
 * @apiParam (Query) {string} [rarity] Search `ssr+` / `ssr` / `sr` / `r` / `n` only.
 * @apiParam (Query) {string} [type] Search with only:
 *  <br>- **Kamihime Only**: `healer` / `offense` / `tricky` / `balance` / `defense`
 *  <br>- **Weapon Only**: `hammer` / `lance` / `glaive` / `arcane` / `staff` / `axe` / `gun` / `bow` / `sword`
 *
 * @apiSuccess {/id[]} items An array of items (up to 10 items) from `GET /id` object.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  [
 *    {
 *    "_rowId": 204,
 *    "id": "e6021",
 *    "name": "Jack Frost",
 *    "approved": 1,
 *    "avatar": "portrait/Jack Frost Portrait.png",
 *    "main": "main/Jack Frost.png",
 *    "preview": "close/Jack Frost Close.png",
 *    "loli": 1,
 *    "peeks": "1715",
 *    "harem1Title": "Clinking Head and Hands",
 *    "harem1Resource1": "1e3a94a3d3d8348f86482b055d2dd8db4a70cac361bc9f51",
 *    "harem2Title": "Chilled Hands and Feet, Burning Desire",
 *    "harem2Resource1": "1e3a94a3d3d8348f35658ab6e49a6d134a70cac361bc9f51",
 *    "harem2Resource2": "1e3a94a3d3d8348f79b2217040cc025206f12ba16f14d7ad",
 *    "harem3Title": null,
 *    "harem3Resource1": null,
 *    "harem3Resource2": null,
 *    "element": "Water",
 *    "type": null,
 *    "rarity": "SSR",
 *    "tier": null
 *    }, ...items
 *  ]
 */
export default class GetSearchRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'search',
      max: 3,
      method: 'GET',
      route: [ '/search' ]
    });
  }

  public async exec (req: Request, res: Response) {
    let itemClass: any = req.query.class;
    const name: string = decodeURI(req.query.name as string);
    const accurate: number = parseInt(req.query.accurate as string);
    const approved: number = parseInt(req.query.approved as string);
    const loli: number = parseInt(req.query.loli as string);
    const element: string = req.query.element as string;
    const rarity: string = req.query.rarity as string;
    const type: string = req.query.type as string;

    if (!name) throw new ApiError(400, 'Name query is required.');
    else if (name.length < 2) throw new ApiError(422, 'Name must be at least 2 characters.');
    else if (name.length > 35) throw new ApiError(422, 'Name must be no longer than 35 characters.');

    switch (itemClass) {
      case 'soul':
        itemClass = el => el.id.startsWith('s');
        break;
      case 'eidolon':
        itemClass = el => el.id.startsWith('x') || el.id.startsWith('e');
        break;
      case 'kamihime':
        itemClass = el => el.id.startsWith('k');
        break;
      case 'weapon':
        itemClass = el => el.id.startsWith('w');
        break;
      default:
    }

    if (itemClass && typeof itemClass !== 'function')
      throw new ApiError(403, [
        'Invalid item class from [soul,eidolon,kamihime,weapon].',
        'Perhaps you are confusing this with `type` parameter?',
      ]);

    const fuseOptions: Fuse.FuseOptions<IKamihime> = {
      distance: 100,
      keys: [ 'name' ],
      location: 0,
      maxPatternLength: 31,
      minMatchCharLength: 2,
      shouldSort: true,
      threshold: 0.35
    };
    let results: IKamihime[] = !isNaN(accurate) && accurate
        ? this.server.kamihime.filter(el => el.name.toLowerCase() === name.toLowerCase())
        : new Fuse(this.server.kamihime, fuseOptions).search(name) as IKamihime[];

    if (typeof itemClass === 'function')
      results = results.filter(itemClass);

    if (element)
      results = results.filter(el => String(el.element).toLowerCase() === element.toLowerCase());

    if (type)
      results = results.filter(el => String(el.type).toLowerCase() === type.toLowerCase());

    if (rarity)
      results = results.filter(el =>  String(el.rarity).toLowerCase() === rarity.toLowerCase());

    if (!isNaN(approved))
      results = results.filter(el => el.approved === approved);

    if (!isNaN(loli))
      results = results.filter(el => el.loli === loli);

    if (!results.length) throw new ApiError(404);

    res
      .status(200)
      .json(results.slice(0, 10));
  }
}
