import { Response } from 'express';
import Api from '../../struct/Api';

const fields = ['id', 'name'];

export = GetLatestRequest;
class GetLatestRequest extends Api {
  constructor() {
    super({
      method: 'GET',
      cooldown: 5,
      max: 1
    });
  }

  async exec(_, res: Response): Promise<void> {
    try {
      const soul: any[] = await this.server.util.db('kamihime').select(fields)
        .whereRaw('haremHentai1Resource2 IS NOT NULL AND id LIKE \'s%\' AND approved=1')
        .orderBy('ROWID', 'desc')
        .limit(3);
      const eidolon: any[] = await this.server.util.db('kamihime').select(fields)
        .whereRaw('haremHentai1Resource2 IS NOT NULL AND id LIKE \'e%\' AND approved=1')
        .orderBy('ROWID', 'desc')
        .limit(3);
      const ssra: any[] = await this.server.util.db('kamihime').select(fields)
        .whereRaw('haremHentai1Resource2 IS NOT NULL AND id LIKE \'k%\' AND rarity=\'SSR+\' AND approved=1')
        .orderBy('ROWID', 'desc')
        .limit(3);
      const ssr: any[] = await this.server.util.db('kamihime').select(fields)
        .whereRaw('haremHentai1Resource2 IS NOT NULL AND id LIKE \'k%\' AND rarity=\'SSR\' AND approved=1')
        .orderBy('ROWID', 'desc')
        .limit(3);
      const sr: any[] = await this.server.util.db('kamihime').select(fields)
        .whereRaw('haremHentai1Resource2 IS NOT NULL AND id LIKE \'k%\' AND rarity=\'SR\' AND approved=1')
        .orderBy('ROWID', 'desc')
        .limit(3);
      const r: any[] = await this.server.util.db('kamihime').select(fields)
        .whereRaw('haremHentai1Resource2 IS NOT NULL AND id LIKE \'k%\' AND rarity=\'R\' AND approved=1')
        .orderBy('ROWID', 'desc')
        .limit(3);

      res
        .status(200)
        .json({ soul, eidolon, 'ssr+': ssra, ssr, sr, r });
    } catch (err) { this.server.util.handleError(res, err); }
  }
}
