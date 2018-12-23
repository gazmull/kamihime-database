import { Request, Response } from 'express';
import Api from '../../struct/Api';

export default class PostAddRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 1,
      method: 'POST',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    let data = req.body;
    try {
      await this._hasData(data);

      const [ character ]: IKamihime[] = await this.util.db('kamihime').select('id')
        .where('id', data.id)
        .limit(1);

      if (character) throw { code: 403, message: 'Character already exists.' };

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
        loli = 0,
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
        id,
        name,
      }, el => el);

      if (!Object.keys(data).length) throw { code: 403, message: 'Cannot accept empty character data.' };

      Object.assign(data, { loli, peeks: 0 });
      await this.util.db('kamihime').insert(data);

      if (this.client.auth.discord.dbReportChannel)
        await this.util.discordSend(this.client.auth.discord.dbReportChannel, [
          `${user} added: \`\`\`py`,
          Object.entries(data).map(el => {
            const [ key, value ] = el;

            return `${key}='${value}'`;
          }).join('\n'),
          '```',
        ].join('\n'));

      this.util.logger.status(`[ADD] API: Character: ${name} (${id}) | By: ${user}`);

      res
        .status(201)
        .json({ name, id });
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
