import { Request, Response } from 'express';
import Api from '../../struct/Api';

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
