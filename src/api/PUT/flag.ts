import { Request, Response } from 'express';
import Api from '../../struct/Api';

export default class PutFlagRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 1,
      method: 'PUT',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      await this._hasData(data);
      const { user, id, name } = data;
      const fields: string[] = [ 'id', 'loli' ];
      const [ character ]: IKamihime[] = await this.util.db('kamihime').select(fields)
        .where('id', id)
        .limit(1);

      if (!character) throw { code: 404, message: 'Character not found.' };

      const loliToggle: number = character.loli ? 0 : 1;

      await this.util.db('kamihime')
        .update('loli', loliToggle)
        .where('id', id);

      if (this.client.auth.discord.dbReportChannel)
        await this.util.discordSend(this.client.auth.discord.dbReportChannel, [
          user,
          loliToggle ? 'flagged' : 'unflagged',
          name,
          `(${id}).`,
        ].join(' '));

      this.util.logger.status(`[F] API: Character: ${name} (${id}) | By: ${user}`);

      res
        .status(200)
        .json({ name, id, loli: loliToggle });
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
