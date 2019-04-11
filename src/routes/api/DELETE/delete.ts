import { Request, Response } from 'express';
import { IKamihime } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';

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
export default class DeleteDeleteRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'delete',
      max: 1,
      method: 'DELETE',
      route: [ '/delete' ]
    });
  }

  public async exec (req: Request, res: Response) {
    const data = req.body;

    if (!res.locals.user.admin)
      await this._hasData(data);

    const { id } = data;
    const user = data.user || req.signedCookies.userId;
    const [ character ]: IKamihime[] = await this.util.db('kamihime').select([ 'name', 'id' ]).where('id', id);

    if (!character) throw { code: 404, message: 'Character not found.' };

    const name = character.name;

    await this.util.db('kamihime').where('id', id).delete();

    if (this.client.auth.discord.dbReportChannel)
      await this.util.discordSend(this.client.auth.discord.dbReportChannel, `${user} deleted ${name} (${id}).`);

    this.util.logger.info(`[D] API: Character: ${name} (${id}) | By: ${user}`);

    res
      .status(200)
      .json({ id, name });
  }
}
