import { Request, Response } from 'express';
import Api from '../../struct/Api';

export = PutFlagRequest;
class PutFlagRequest extends Api {
  constructor() {
    super({
      method: 'PUT',
      cooldown: 5,
      max: 1
    });
  }

  async exec(req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      await this._hasData(data);
      const { user, id, name } = data;
      const fields: string[] = ['id', 'loli'];
      const [ character ] = await this.server.util.db('kamihime').select(fields)
        .where('id', id)
        .limit(1);

      if (!character) throw { code: 404, message: 'Character not found.' };

      const loliToggle: number = character.loli ? 0 : 1;

      await this.server.util.db('kamihime')
        .update('loli', loliToggle)
        .where('id', id);

      if (this.server.auth.hook)
        await this.server.util.webHookSend([
          user,
          loliToggle ? 'flagged' : 'unflagged',
          name,
          `(${id}).`
        ].join(' '));

      this.server.util.logger.status(`[F] API: Character: ${name} (${id}) | By: ${user}`);

      res
        .status(200)
        .json({ name, id, loli: loliToggle });
    } catch (err) { this.server.util.handleApiError(res, err); }
  }
}
