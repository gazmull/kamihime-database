import { Request, Response } from 'express';
import { Knex } from 'knex';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

const defaultFields = [
  'id', 'name',
  'avatar', 'main', 'preview',
  'hp', 'atk',
  'element', 'rarity', 'type', 'tier',
  'peeks', 'loli',
  'harem1Title', 'harem1Resource1',
  'harem2Title', 'harem2Resource1', 'harem2Resource2',
  'harem3Title', 'harem3Resource1', 'harem3Resource2',
  'created',
];
const fields = {
  eidolon: [
    'id', 'name',
    'avatar', 'main', 'preview',
    'hp', 'atk',
    'element',
    'rarity',
    'peeks', 'loli',
    'harem1Title', 'harem1Resource1',
    'harem2Title', 'harem2Resource1', 'harem2Resource2',
    'created',
  ],
  kamihime: [
    'id', 'name',
    'avatar', 'main', 'preview',
    'hp', 'atk',
    'element', 'type',
    'rarity',
    'peeks', 'loli',
    'harem1Title', 'harem1Resource1',
    'harem2Title', 'harem2Resource1', 'harem2Resource2',
    'harem3Title', 'harem3Resource1', 'harem3Resource2',
    'created',
  ],
  soul: [
    'id', 'name',
    'avatar', 'main', 'preview',
    'type',
    'tier',
    'peeks', 'loli',
    'harem1Title', 'harem1Resource1',
    'harem2Title', 'harem2Resource1', 'harem2Resource2',
    'created',
  ],
  weapon: [
    'id', 'name',
    'avatar', 'main',
    'hp', 'atk',
    'element', 'rarity', 'type',
    'created',
  ],
  default: defaultFields,
  internal: defaultFields.concat('_rowId', 'approved', 'mUpdated')
};
const concat = (k: string, v: any) => `${k} = ${isNaN(v) ? `'${v}'` : v}`;
const c = {
  element: v => concat('element', v),
  id: v => `id LIKE '${v}%'`,
  rarity: v => concat('rarity', v),
  tier: v => concat('tier', v),
  type: v => concat('type', v)
};

/* tslint:disable:object-literal-sort-keys */

const queries = {
  soul: c.id('s'), eidolon: `(${c.id('e')} or ${c.id('x')})`, kamihime: c.id('k'), weapon: c.id('w'),
  'ssr+': c.rarity('SSR+'), ssr: c.rarity('SSR'), sr: c.rarity('SR'), r: c.rarity('R'), n: c.rarity('N'), skin: c.rarity('SKIN'),
  supreme: c.tier('S'), legendary: c.tier('A'), elite: c.tier('B'), standard: c.tier('C'),
  healer: c.type('Healer'), offense: c.type('Offense'), tricky: c.type('Tricky'), balance: c.type('Balance'),
    defense: c.type('Defense'),
  hammer: c.type('Hammer'), lance: c.type('Lance'), glaive: c.type('Glaive'), arcane: c.type('Arcane'),
    staff: c.type('Staff'), axe: c.type('Axe'), gun: c.type('Gun'), bow: c.type('Bow'), sword: c.type('Sword'),
  light: c.element('Light'), dark: c.element('Dark'), wind: c.element('Wind'), thunder: c.element('Thunder'),
    water: c.element('Water'), fire: c.element('Fire'), phantom: c.element('Phantom'),
  approved: 'approved = 1',
  loli: 'loli = 1', 'no-loli': 'loli = 0'
};

/* tslint:enable:object-literal-sort-keys */

/* tslint:disable:max-line-length */

/**
 * @api {get} /list/:options list
 * @apiName GetList
 * @apiGroup Kamihime Specific
 * @apiDescription Retrieves a list of items.
 * `:options` available:
 * ### Primary Options
 *  > A must before any other options.
 *  - `soul` / `eidolon` / `kamihime` / `weapon`
 *  - `approved` / `loli` / `no-loli`
 * ### Secondary Options
 *  - **Soul Only**: `s` / `a` / `b` / `c`
 *  - **Kamihime Only**: `healer` / `offense` / `tricky` / `balance` / `defense`
 *  - **Weapon Only**: `hammer` / `lance` / `glaive` / `arcane` / `staff` / `axe` / `gun` / `bow` / `sword`
 *  - **Eidolon / Kamihime / Weapon Only**:
 *    - `light` / `dark` / `wind` / `thunder` / `water` / `fire` / `phantom`
 *    - `ssr+` / `ssr` / `sr` / `r` / `n` / `skin`
 * ### Sort Options
 *  - **Sort By**: `name` / `rarity` / `tier` / `element` / `type` / `atk` / `hp`
 *  - **Sort Type**: `asc` / `desc`
 *
 * @apiExample {html} Example: this will return items that are approved, eidolon, not a loli, and of water element, sorted by rarity (ascending).
 * https://kamihimedb.win/api/list/approved/eidolon/no-loli/water?sort=rarity-asc
 * @apiParam {string} [options] An array of options with `/` delimiter. See description.
 * @apiParam (Query) {string} [sort] Sorts the list. Syntax: `sortBy-sortType` (default: `name-asc`)
 *
 * @apiSuccess {/id[]} items An array of items from `GET /id` object.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  [
 *    {
 *    "id": "e6021",
 *    "name": "Jack Frost",
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

 /* tslint:enable:max-line-length */

export default class GetListRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'list',
      max: 2,
      method: 'GET',
      route: [ '/list(/*)?' ]
    });
  }

  public async exec (req: Request, res: Response) {
    let tags: string[] = req.params[0] ? req.params[0].split('/') : [];
    tags = tags.filter(el => queries[el]);
    const length = tags.length;
    const validPrimaries: string[] = [ 'soul', 'eidolon', 'kamihime', 'weapon', 'approved', 'loli', 'no-loli' ];

    if (length && !validPrimaries.includes(tags[0]))
      throw new ApiError(422, 'Invalid first parameter. It must be one of the following: ' + validPrimaries.join(', '));

    validPrimaries.splice(validPrimaries.indexOf('approved'), 3);

    if (tags.filter(el => validPrimaries.includes(el)).length > 1)
      throw new ApiError(422, 'You may only select one primary variable.');

    // tslint:disable-next-line:prefer-const
    let [ sortBy = 'name', sortType = 'asc' ]: string[] = req.query.sort
      ? (req.query.sort as string).split('-')
      : [];

    if (![ 'name', 'rarity', 'tier', 'element', 'type', 'atk', 'hp' ].includes(sortBy))
      sortBy = 'name';

    let query: Knex.QueryBuilder = this.server.util.db('kamihime')
      .select(tags[0] ? fields[tags[0]] : (req.query.internal ? fields.internal : fields.default))
      .orderBy(sortBy, sortType);

    if (length) {
      const rawQuery = tags.map(el => queries[el.toLowerCase()]).join(' AND ');

      query = query.whereRaw(rawQuery);
    }

    res
      .status(200)
      .json(await query);
  }
}
