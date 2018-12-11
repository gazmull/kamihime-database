import { Request, Response } from 'express';
import Api from '../../struct/Api';

export default class DeleteRequest extends Api {
  constructor() {
    super({
      method: 'DELETE',
      cooldown: 5,
      max: 1
    });
  }

  async exec(req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      await this._hasData(data);
      const { user, id, name } = data;
      const character = await this.server.util.db('kamihime').select('id').where('id', id);

      if (!character) throw { code: 404, message: 'Character not found.' };

      await this.server.util.db('kamihime').where('id', id).delete();

      if (this.server.auth.hook)
        await this.server.util.webHookSend(`${user} deleted ${name} (${id}).`);

      this.server.util.logger.status(`[D] API: Character: ${name} (${id}) | By: ${user}`);

      res
        .status(200)
        .json({ id, name });
    } catch (err) { this.server.util.handleApiError(res, err); }
  }
}
