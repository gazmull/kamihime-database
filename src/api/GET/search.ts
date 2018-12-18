import { Request, Response } from 'express';
import * as fuzzy from 'fuzzy';
import Api from '../../struct/Api';

export default class GetSearchRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 3,
      method: 'GET',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    let itemClass: any = req.query.class;
    const name: string = decodeURI(req.query.name);
    const accurate: number = parseInt(req.query.accurate);
    const loli: number = parseInt(req.query.loli);
    const element: string = req.query.element;
    const rarity: string = req.query.rarity;
    const type: string = req.query.type;

    try {
      if (!name) throw { code: 403, message: 'Name query is required.' };
      if (name.length < 2) throw { code: 403, message: 'Name must be at least 2 characters.' };

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
        throw {
          code: 403,
          message: [
            'Invalid item class from [soul,eidolon,kamihime,weapon].',
            'Perhaps you are confusing this with `type` parameter?',
          ],
        };

      let results = !isNaN(accurate) && accurate
          ? this.server.kamihimeCache.filter(el => el.name.toLowerCase() === name.toLowerCase())
          : fuzzy.filter(name, this.server.kamihimeCache, { extract: el => el.name })
            .map(el => el.original);

      if (typeof itemClass === 'function')
        results = results.filter(itemClass);

      if (element)
        results = results.filter(el => String(el.element).toLowerCase() === element.toLowerCase());

      if (type)
        results = results.filter(el => String(el.type).toLowerCase() === type.toLowerCase());

      if (rarity)
        results = results.filter(el =>  String(el.rarity).toLowerCase() === rarity.toLowerCase());

      if (!isNaN(loli))
        results = results.filter(el => el.loli === loli);

      if (!results.length) throw { code: 404, message: 'No item matches this query.' };

      res
        .status(200)
        .json(results);
    } catch (err) { this.server.util.handleApiError(res, err); }
  }
}
