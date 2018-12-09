import { Request, Response } from 'express';
import Api from '../../struct/Api';

export = PostAddRequest;
class PostAddRequest extends Api {
  constructor() {
    super({
      method: 'POST',
      cooldown: 5,
      max: 1
    });
  }

  async exec(req: Request, res: Response): Promise<void> {
    let data = req.body;
    try {
      await this._hasData(data);

      const [ character ] = await this.server.util.db('kamihime').select('id')
        .where('id', data.id)
        .limit(1);

      if (character) throw { code: 403, message: 'Character already exists.' };

      const {
        user,
        id,
        name,
        loli = 0,
        harem1Title,
        harem1Resource1,
        harem2Title,
        harem2Resource1,
        harem2Resource2,
        harem3Title,
        harem3Resource1,
        harem3Resource2
      } = data;
      data = this._filter({
        name,
        harem1Title,
        harem1Resource1,
        harem2Title,
        harem2Resource1,
        harem2Resource2,
        harem3Title,
        harem3Resource1,
        harem3Resource2
      }, el => el);

      if (!Object.keys(data).length) throw { code: 403, message: 'Cannot accept empty character data.' };

      Object.assign(data, { loli, peeks: 0 });
      await this.server.util.db('kamihime').insert(data);

      if (this.server.auth.hook)
        await this.server.util.webHookSend([
          `${user} added: \`\`\`py`,
          Object.entries(data).map(el => {
            const key = Object.keys(el)[0];
            const value = el[key];

            return `${key}=${value}`;
          }),
          '```'
        ].join('\n'));

      this.server.util.logger.status(`[ADD] API: Character: ${name} (${id}) | By: ${user}`);

      res
        .status(201)
        .json({ name, id });
    } catch (err) { this.server.util.handleApiError(res, err); }
  }
}
