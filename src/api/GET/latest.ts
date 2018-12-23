import { Response } from 'express';
import Api from '../../struct/Api';

const fields = [ 'id', 'name' ];

export default class GetLatestRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 1,
      method: 'GET',
    });
  }

  public async exec (_, res: Response): Promise<void> {
    try {
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
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
