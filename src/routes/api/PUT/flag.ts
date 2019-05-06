import { Request, Response } from 'express';
import { IKamihime } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

/**
 * @api {put} /flag flag
 * @apiName PutFlag
 * @apiGroup Kamihime Specific
 * @apiDescription Flags/Unflags a character as loli from the database.
 * @apiPermission Owner Only
 *
 * @apiParam (Request Body) {string} id The item's ID.
 * @apiParam (Request Body) {string} user The user's ID.
 * @apiParam (Request Body) {string} token The user's authentication token.
 *
 * @apiSuccess {string} id The item's ID.
 * @apiSuccess {string} name The item's name.
 * @apiSuccess {number} flagged The current status of the character for flag.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": "k0001",
 *    "name": "Satan",
 *    "loli": 0
 *  }
 */
export default class PutFlagRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'flag',
      max: 1,
      method: 'PUT',
      route: [ '/flag' ]
    });
  }

  public async exec (req: Request, res: Response) {
    const data = req.body;

    if (!res.locals.user.admin)
      await this._hasData(data);

    const { id } = data;
    const user = data.user || req.signedCookies.userId;
    const fields: string[] = [ 'name', 'id', 'loli' ];
    const [ character ]: IKamihime[] = await this.server.util.db('kamihime').select(fields)
      .where('id', id)
      .limit(1);

    if (!character) throw new ApiError(404);

    const name = character.name;
    const loliToggle: number = character.loli ? 0 : 1;

    await this.server.util.db('kamihime')
      .update('loli', loliToggle)
      .where('id', id);

    if (this.client.auth.discord.dbReportChannel)
      await this.server.util.discordSend(this.client.auth.discord.dbReportChannel, [
        user,
        loliToggle ? 'flagged' : 'unflagged',
        name,
        `(${id}).`,
      ].join(' '));

    this.server.util.logger.info(`[F] API: Character: ${name} (${id}) | By: ${user}`);

    res
      .status(200)
      .json({ name, id, loli: loliToggle });
  }
}
