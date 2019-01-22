import { Request, Response } from 'express';
import Api from '../../struct/Api';

/**
 * @api {delete} /delete delete
 * @apiName DeleteDelete
 * @apiGroup Kamihime Specific
 * @apiDescription Deletes an item from the database.
 * @apiPermission Owner Only
 *
 * @apiParam (Request Body) {string} id The item's ID.
 * @apiParam (Request Body) {string} user The user's ID.
 * @apiParam (Request Body) {string} token The user's authentication token.
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
export default class DeleteDeleteRequest extends Api {
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
      if (!res.locals.user.admin)
        await this._hasData(data);

      const { id } = data;
      const user = data.user || req.cookies.userId;
      const [ character ]: IKamihime[] = await this.util.db('kamihime').select([ 'name', 'id' ]).where('id', id);

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
