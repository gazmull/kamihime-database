import { QueryBuilder } from 'knex';
import { Request, Response } from 'express';
import Api from '../../struct/Api';

const fields = {
  soul: [
    'id', 'name',
    'avatar', 'main', 'preview',
    'type',
    'tier',
    'peeks', 'loli',
    'harem1Title', 'harem1Resource1',
    'harem2Title', 'harem2Resource1', 'harem2Resource2'
  ],
  eidolon: [
    'id', 'name',
    'avatar', 'main', 'preview',
    'element',
    'rarity',
    'peeks', 'loli',
    'harem1Title', 'harem1Resource1',
    'harem2Title', 'harem2Resource1', 'harem2Resource2'
  ],
  kamihime: [
    'id', 'name',
    'avatar', 'main', 'preview',
    'element', 'type',
    'rarity',
    'peeks', 'loli',
    'harem1Title', 'harem1Resource1',
    'harem2Title', 'harem2Resource1', 'harem2Resource2',
    'harem3Title', 'harem3Resource1', 'harem3Resource2'
  ],
  weapon: [
    'id', 'name',
    'avatar', 'main',
    'element', 'rarity', 'type'
  ]
};
const concat: (c: string, v: any) => string = (c, v) => `${c} = ${isNaN(v) ? `'${v}'` : v}`;
const c = {
  element: v => concat('element', v),
  id: v => `id LIKE '${v}%'`,
  rarity: v => concat('rarity', v),
  tier: v => concat('tier', v),
  type: v => concat('type', v)
};
const queries = {
  soul: c.id('s'), eidolon: `(${c.id('e')} or ${c.id('x')})`, kamihime: c.id('k'), weapon: c.id('w'),
  'ssr+': c.rarity('SSR+'), ssr: c.rarity('SSR'), sr: c.rarity('SR'), r: c.rarity('R'), n: c.rarity('N'),
  legendary: c.tier('Legendary'), elite: c.tier('Elite'), standard: c.tier('Standard'),
  healer: c.type('Healer'), offense: c.type('Offense'), tricky: c.type('Tricky'), balance: c.type('Balance'), defense: c.type('Defense'),
  hammer: c.type('Hammer'), lance: c.type('Lance'), glaive: c.type('Glaive'), arcane: c.type('Arcane'), staff: c.type('Staff'),
    axe: c.type('Axe'), gun: c.type('Gun'), bow: c.type('Bow'), sword: c.type('Sword'),
  light: c.element('Light'), dark: c.element('Dark'), wind: c.element('Wind'), thunder: c.element('Thunder'), water: c.element('Water'),
    fire: c.element('Fire'), phantom: c.element('Phantom'),
  approved: 'approved = 1',
  loli: 'loli = 1', 'no-loli': 'loli = 0'
};

export default class GetListRequest extends Api {
  constructor() {
    super({
      method: 'GET',
      cooldown: 5,
      max: 1
    });
  }

  async exec(req: Request, res: Response): Promise<void> {
    let tags: string[] = req.params[0] ? req.params[0].split('/') : [];
    tags = tags.filter(el => queries[el]);
    const length = tags.length;
    const validPrimaries: string[] = ['soul', 'eidolon', 'kamihime', 'weapon', 'approved', 'loli'];

    try {
      if (length && !validPrimaries.includes(tags[0]))
        throw {
          code: 403,
          message: 'Invalid first parameter. It must be one of the following: ' + validPrimaries.join(', ')
        };

      validPrimaries.splice(validPrimaries.indexOf('approved'), 2);

      if (tags.filter(el => validPrimaries.includes(el)).length > 1)
        throw {
          code: 403,
          message: 'You may only select one primary variable.'
        };

      let query: QueryBuilder = this.server.util.db('kamihime').select(tags[0] ? fields[tags[0]] : '*')
        .orderBy('name', 'asc');

      if (length) {
        const rawQuery = tags.map(el => queries[el.toLowerCase()]).join(' AND ');

        query = query.whereRaw(rawQuery);
      }

      query = await query;

      res
        .status(200)
        .json(query);
    } catch (err) { this.server.util.handleApiError(res, err); }
  }
}
