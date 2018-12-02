import { Request, Response } from 'express';
import Api from '../../struct/Api';

const fields = [
  'id', 'name',
  'avatar',
  'loli', 'peeks',
  'haremIntroTitle', 'haremIntroResource1',
  'haremHentai1Title', 'haremHentai1Resource1', 'haremHentai1Resource2',
  'haremHentai2Title', 'haremHentai2Resource1', 'haremHentai2Resource2'
];

export = GetIdRequest;
class GetIdRequest extends Api {
  constructor() {
    super({
      method: 'GET',
      cooldown: 5,
      max: 3
    });
  }

  async exec(req: Request, res: Response): Promise<void> {
    const id: any = req.params[0];
    const validId: Array<string> = ['s', 'k', 'e', 'w', 'x'];
    const checkId: boolean = id && validId.includes(id.charAt(0)) && !isNaN(id.slice(1));

    try {
      if (!checkId) throw { code: 403, message: 'Invalid id.' };

      const [ character ] = await this.server.util.db('kamihime').select(fields)
        .where('id', id).limit(1);

      if (!character) throw { code: 404, message: 'Character not found.' };

      res
        .status(200)
        .json(character);
    } catch (err) { this.server.util.handleError(res, err); }
  }
}
