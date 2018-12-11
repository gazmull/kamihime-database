import { Request, Response } from 'express';
import Api from '../../struct/Api';

export default class PutApproveRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 1,
      method: 'PUT'
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      await this._hasData(data);
      const { user, id, name } = data;
      const fields: string[] = [ 'id', 'approved' ];
      const [ character ] = await this.server.util.db('kamihime').select(fields)
        .where('id', id)
        .limit(1);

      if (!character) throw { code: 404, message: 'Character not found.' };

      const approveToggle: number = character.approved ? 0 : 1;

      await this.server.util.db('kamihime')
        .update('approved', approveToggle)
        .where('id', id);

      if (this.server.auth.hook)
        await this.server.util.webHookSend([
          user,
          approveToggle ? 'approved' : 'disapproved',
          name,
          `(${id}).`
        ].join(' '));

      this.server.util.logger.status(`[A/D] API: Character: ${name} (${id}) | By: ${user}`);

      res
        .status(200)
        .json({ name, id, approved: approveToggle });
    } catch (err) { this.server.util.handleApiError(res, err); }
  }
}
