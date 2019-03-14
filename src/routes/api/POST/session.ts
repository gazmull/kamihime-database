import { Request, Response } from 'express';
import * as shortid from 'shortid';
import { IKamihime, ISession } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';

shortid.seed(11);

/**
 * @api {post} /session session
 * @apiName PostSession
 * @apiGroup Kamihime Specific
 * @apiDescription Creates a session for updating an item from the database.
 * @apiPermission Owner Only
 *
 * @apiParam (Request Body) {string} id The item's ID.
 * @apiParam (Request Body) {string} user The user's ID.
 * @apiParam (Request Body) {string} token The user's authentication token.
 *
 * @apiSuccess {string} id The sessions's ID.
 * @apiSuccess {string} password The session's password.
 * @apiSuccess {string} created The session's creation date.
 * @apiSuccess {string} characterId The item's ID.
 * @apiSuccess {string} userId The user's ID.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": "sdww2fh",
 *    "password": "h2no387sw",
 *    "created": "2018-12-29 04:21:04",
 *    "characterId": "k0001",
 *    "userId": "319102712383799296"
 *  }
 */
export default class PostSessionRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'session',
      max: 1,
      method: 'POST',
      route: [ '/session' ],
    });
  }

  public async exec (req: Request, res: Response) {
    const data = req.body;

    await this._hasData(data);
    const { user, id } = data;
    const characterFields: string[] = [ 'id', 'name' ];
    const [ character ]: IKamihime[] = await this.util.db('kamihime').select(characterFields)
      .where('id', id)
      .limit(1);

    if (!character) throw { code: 404, message: 'Character not found.' };

    const [ session ]: ISession[] = await this.util.db('sessions').select()
      .where('userId', user)
      .andWhere('characterId', id)
      .limit(1);

    if (session) {
      res
        .status(202)
        .json({
          characterId: session.characterId,
          code: 202,
          id: session.id,
          message: 'Already existing session.',
          password: session.password,
        });

      return;
    }

    const sessions: ISession[] = await this.util.db
      .raw('SELECT COUNT(characterId) FROM sessions WHERE userId = ?', [ user ]);

    if (sessions.length > 3)
      throw { code: 429, message: `Too many sessions active. [${sessions.length} sessions active]` };

    const uniqueId: string = Math.random().toString(36).substr(2, 16);
    const uniqueKey: string = Buffer.from(shortid.generate()).toString('base64');

    await this.util.db('sessions')
      .insert({
        characterId: id,
        id: uniqueId,
        password: uniqueKey,
        userId: user,
      });

    const [ newSession ]: ISession[] = await this.util.db('sessions').select()
      .where('userId', user)
      .andWhere('characterId', id)
      .limit(1);

    await this.util.discordSend(
      this.client.auth.discord.dbReportChannel,
      `${user}'s session for ${character.name} (${character.id}) has been created.`,
    );

    this.util.logger.info(`[A] API: Character-Session: ${character.name} (${id}) | By: ${user}`);

    res
      .status(200)
      .json(newSession);
  }
}
