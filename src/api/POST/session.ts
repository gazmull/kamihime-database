import { Request, Response } from 'express';
import * as shortid from 'shortid';
import Api from '../../struct/Api';

shortid.seed(11);

export default class PostSessionRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 1,
      method: 'POST',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      await this._hasData(data);
      const { user, id, name } = data;
      const characterFields: string[] = [ 'id', 'name' ];
      const [ character ]: IKamihime[] = await this.util.db('kamihime').select(characterFields)
        .where('id', id)
        .limit(1);

      if (!character) throw { code: 404, message: 'Character not found.' };

      const [ session ]: ISession[] = await this.util.db('sessions').select()
        .where('userId', user)
        .andWhere('characterId', id)
        .limit(1);

      if (session) {
        res
          .status(202)
          .json({
            characterId: session.characterId,
            code: 202,
            id: session.id,
            message: 'Already existing session.',
            password: session.password,
          });

        return;
      }

      const sessions: ISession[] = await this.util.db('sessions').select('count(characterId)')
          .where('userId', user);

      if (sessions.length > 3)
        throw { code: 429, message: `Too many sessions active. [${sessions.length} sessions active]` };

      const uniqueID: string = Math.random().toString(36).substr(2, 16);
      const uniqueKey: string = Buffer.from(shortid.generate()).toString('base64');

      await this.util.db('sessions')
        .insert({
          characterId: id,
          id: uniqueID,
          password: uniqueKey,
          userId: user,
        });

      const [ newSession ]: ISession[] = await this.util.db('sessions').select()
        .where('user', user)
        .andWhere('characterId', id)
        .limit(1);

      await this.util.discordSend(
        this.client.auth.discord.dbReportChannel,
        `${user}'s session for ${character.name} (${character.id}) has been created.`,
      );

      this.util.logger.status(`[A] API: Character-Session: ${name} (${id}) | By: ${user}`);

      res
        .status(200)
        .json(newSession);
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
