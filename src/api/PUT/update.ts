import { Request, Response } from 'express';
import Api from '../../struct/Api';

export = PutUpdateRequest;
class PutUpdateRequest extends Api {
  constructor() {
    super({
      method: 'PUT',
      cooldown: 5,
      max: 1
    });
  }

  async exec(req: Request, res: Response): Promise<void> {
    let data = req.body;

    try {
      await this._hasData(data);
      const fields: string[] = ['id', 'loli'];
      const [ character ] = await this.server.util.db('kamihime').select(fields)
        .where('id', data.id)
        .limit(1);

      if (!character) throw { code: 404, message: 'Character not found.' };

      const {
        user,
        id,
        name,
        avatar,
        haremIntroTitle,
        haremIntroResource1,
        haremHentai1Title,
        haremHentai1Resource1,
        haremHentai1Resource2,
        haremHentai2Title,
        haremHentai2Resource1,
        haremHentai2Resource2
      } = data;
      data = this._filter({
        name,
        haremIntroTitle,
        haremIntroResource1,
        haremHentai1Title,
        haremHentai1Resource1,
        haremHentai1Resource2,
        haremHentai2Title,
        haremHentai2Resource1,
        haremHentai2Resource2
      }, el => el);

      if (!Object.keys(data).length) throw { code: 403, message: 'Cannot accept empty character data.' };

      await this.server.util.db('kamhime').update(data)
        .where('id', id);
      await this.server.util.db('kamihime')
        .where({ user, cID: id })
        .del();

      if (this.server.auth.hook)
        await this.server.util.webHookSend([
          `${user} updated ${name} (${id}):\`\`\``,
          Object.entries(data).map(el => {
            const key = Object.keys(el)[0];
            const value = el[key];

            return `${key}=${value}`;
          }),
          '```'
        ].join('\n'));

      this.server.util.logger.status(`[U] API: Character: ${name} (${id}) | By: ${user}`);

      res
        .status(200)
        .json({ name, id, avatar });
    } catch (err) { this.server.util.handleError(res, err); }
  }
}
