import { Request, Response } from 'express';
import Api from '../../struct/Api';

/**
 * @api {post} /add add
 * @apiName PostAdd
 * @apiGroup Kamihime Specific
 * @apiDescription Adds an item to the database.
 * @apiPermission Owner Only
 *
 * @apiParam (Request Body) {string} id The item's ID.
 * @apiParam (Request Body) {string} name The item's name.
 * @apiParam (Request Body) {string} user The user's ID.
 * @apiParam (Request Body) {string} token The user's authentication token.
 * @apiParam (Request Body) {string} [harem1Title=null] The Episode 1 Title.
 * @apiParam (Request Body) {string} [harem1Resource1=null] The Episode 1 Story Resource ID.
 * @apiParam (Request Body) {string} [harem2Title=null] The Episode 2 Title.
 * @apiParam (Request Body) {string} [harem2Resource1=null] The Episode 2 Story Resource ID.
 * @apiParam (Request Body) {string} [harem2Resource2=null] The Episode 2 Scenario Resource ID.
 * @apiParam (Request Body) {string} [harem3Title=null] The Episode 3 Title.
 * @apiParam (Request Body) {string} [harem3Resource1=null] The Episode 3 Story Resource ID.
 * @apiParam (Request Body) {string} [harem3Resource2=null] The Episode 3 Scenario Resource ID.
 * @apiParam (Request Body) {number} [loli=0] `1 / 0 only`: Whether the character is a loli or not.
 * @apiParam (Request Body) {string} [rarity=null] The item's rarity if it ever has one.
 *
 * @apiSuccess {string} id The item's ID.
 * @apiSuccess {string} name The item's name.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": "k0001",
 *    "name": "Satan"
 *  }
 */
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
      if (!res.locals.user.admin)
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
        rarity,
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
        rarity,
      }, el => el);

      if (!Object.keys(data).length) throw { code: 403, message: 'Cannot accept empty character data.' };

      Object.assign(data, { loli, peeks: 0 });
      await this.util.db('kamihime').insert(data);

      const user = data.user || req.cookies.userId;

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
        .json({ id, name });
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
