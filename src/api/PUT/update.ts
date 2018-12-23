import { Request, Response } from 'express';
import Api from '../../struct/Api';

export default class PutUpdateRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 1,
      method: 'PUT',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    let data = req.body;

    try {
      await this._hasData(data);
      const fields: string[] = [ 'id', 'loli' ];
      const [ character ]: IKamihime[] = await this.util.db('kamihime').select(fields)
        .where('id', data.id)
        .limit(1);

      if (!character) throw { code: 404, message: 'Character not found.' };

      const {
        harem1Resource1,
        harem1Title,
        harem2Resource1,
        harem2Resource2,
        harem2Title,
        harem3Resource1,
        harem3Resource2,
        harem3Title,
        id,
        name,
        user,
      } = data;
      data = this._filter({
        harem1Resource1,
        harem1Title,
        harem2Resource1,
        harem2Resource2,
        harem2Title,
        harem3Resource1,
        harem3Resource2,
        harem3Title,
        name,
      }, el => el);

      if (!Object.keys(data).length) throw { code: 403, message: 'Cannot accept empty character data.' };

      await this.util.db('kamihime').update(data)
        .where('id', id);
      await this.util.db('sessions')
        .where({ userId: user, characterId: id })
        .del();

      if (this.client.auth.discord.dbReportChannel)
        await this.util.discordSend(this.client.auth.discord.dbReportChannel, [
          `${user} updated ${name} (${id}):\`\`\``,
          Object.entries(data).map(el => {
            const [ key, value ] = el;

            return `${key}='${value}'`;
          }).join('\n'),
          '```',
        ].join('\n'));

      this.util.logger.status(`[U] API: Character: ${name} (${id}) | By: ${user}`);

      const avatar: IKamihime['avatar'] = this.server.kamihimeCache.find(el => el.id === id).avatar;

      res
        .status(200)
        .json({ name, id, avatar });
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
