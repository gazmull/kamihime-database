import { Request, Response } from 'express';
import Api from '../../struct/Api';

/**
 * @api {put} /update update
 * @apiVersion 2.1.0
 * @apiName PutUpdate
 * @apiGroup Kamihime Specific
 * @apiDescription Updates an item from the database.
 *
 * **Warning**: You have to do to `POST /session` first to obtain an authorization to update an item.
 * @apiPermission Owner Only
 *
 * @apiParam (Request Body) {string} id The item's ID.
 * @apiParam (Request Body) {string} name The item's name.
 * @apiParam (Request Body) {string} user The user's ID.
 * @apiParam (Request Body) {string} token The user's authentication token.
 * @apiParam (Request Body) {string} harem1Title The Episode 1 Title.
 * @apiParam (Request Body) {string} harem1Resource1 The Episode 1 Story Resource ID.
 * @apiParam (Request Body) {string} harem2Title The Episode 2 Title.
 * @apiParam (Request Body) {string} harem2Resource1 The Episode 2 Story Resource ID.
 * @apiParam (Request Body) {string} harem2Resource2 The Episode 2 Scenario Resource ID.
 * @apiParam (Request Body) {string} harem3Title The Episode 3 Title.
 * @apiParam (Request Body) {string} harem3Resource1 The Episode 3 Story Resource ID.
 * @apiParam (Request Body) {string} harem3Resource2 The Episode 3 Scenario Resource ID.
 * @apiParam (Request Body) {string} rarity The item's rarity if it ever has one.
 *
 * @apiSuccess {string} id The item's ID.
 * @apiSuccess {string} name The item's name.
 * @apiSuccess {PathLike} avatar The item's portrait image path.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": "k0001",
 *    "name": "Satan",
 *    "avatar": "portrait/Satan Portrait.png"
 *  }
 */
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

      const [ session ]: ISession[] = await this.util.db('sessions').select('userId')
        .where({ userId: data.user, characterId: data.id });

      if (session) throw { code: 401, message: 'You must create a session before updating a character.' };

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
        rarity,
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
        rarity,
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
