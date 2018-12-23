import { Request, Response } from 'express';
import Api from '../../struct/Api';

export default class DeleteRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 1,
      method: 'DELETE',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      await this._hasData(data);
      const { user, id } = data;
      const [ character ]: IKamihime[] = await this.util.db('kamihime').select('id').where('id', id);

      if (!character) throw { code: 404, message: 'Character not found.' };

      const name = character.name;

      await this.util.db('kamihime').where('id', id).delete();

      if (this.client.auth.discord.dbReportChannel)
        await this.util.discordSend(this.client.auth.discord.dbReportChannel, `${user} deleted ${name} (${id}).`);

      this.util.logger.status(`[D] API: Character: ${name} (${id}) | By: ${user}`);

      res
        .status(200)
        .json({ id, name });
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
