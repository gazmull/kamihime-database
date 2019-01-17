import { Request, Response } from 'express';
import Api from '../../struct/Api';

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
export default class PutFlagRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 1,
      method: 'PUT',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      await this._hasData(data);
      const { user, id } = data;
      const fields: string[] = [ 'id', 'loli' ];
      const [ character ]: IKamihime[] = await this.util.db('kamihime').select(fields)
        .where('id', id)
        .limit(1);

      if (!character) throw { code: 404, message: 'Character not found.' };

      const name = character.name;
      const loliToggle: number = character.loli ? 0 : 1;

      await this.util.db('kamihime')
        .update('loli', loliToggle)
        .where('id', id);

      if (this.client.auth.discord.dbReportChannel)
        await this.util.discordSend(this.client.auth.discord.dbReportChannel, [
          user,
          loliToggle ? 'flagged' : 'unflagged',
          name,
          `(${id}).`,
        ].join(' '));

      this.util.logger.status(`[F] API: Character: ${name} (${id}) | By: ${user}`);

      res
        .status(200)
        .json({ name, id, loli: loliToggle });
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
