import { Request, Response } from 'express';
import Api from '../../struct/Api';

/**
 * @api {put} /approve approve
 * @apiName PutApprove
 * @apiGroup Kamihime Specific
 * @apiDescription Approves/Disapproves a character from the database.
 * @apiPermission Owner Only
 *
 * @apiParam (Request Body) {string} id The item's ID.
 * @apiParam (Request Body) {string} user The user's ID.
 * @apiParam (Request Body) {string} token The user's authentication token.
 *
 * @apiSuccess {string} id The item's ID.
 * @apiSuccess {string} name The item's name.
 * @apiSuccess {number} approved The current status of the character for approval.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": "k0001",
 *    "name": "Satan",
 *    "approved": 1
 *  }
 */
export default class PutApproveRequest extends Api {
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
      const fields: string[] = [ 'id', 'approved' ];
      const [ character ]: IKamihime[] = await this.util.db('kamihime').select(fields)
        .where('id', id)
        .limit(1);

      if (!character) throw { code: 404, message: 'Character not found.' };

      const name = character.name;
      const approveToggle: number = character.approved ? 0 : 1;

      await this.util.db('kamihime')
        .update('approved', approveToggle)
        .where('id', id);

      if (this.client.auth.discord.dbReportChannel)
        await this.util.discordSend(this.client.auth.discord.dbReportChannel, [
          user,
          approveToggle ? 'approved' : 'disapproved',
          name,
          `(${id}).`,
        ].join(' '));

      this.util.logger.status(`[A/D] API: Character: ${name} (${id}) | By: ${user}`);

      res
        .status(200)
        .json({ name, id, approved: approveToggle });
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
