import { Request, Response } from 'express';
import { IReport, IUser } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

/**
 * @api {post} /report report
 * @apiName PostReport
 * @apiGroup Site Specific
 * @apiDescription Creates a user report entry regarding a character to the database.
 *
 * **Warning**: Requires cookies to be passed at headers.
 *
 * @apiParam (Request Body) {string} characterId The character's ID.
 * @apiParam (Request Body) {object} message The user's message.
 * @apiParam (Request Body) {string} message.subject The message's subject.
 * Valid options can be seen at `Message Subject Options`'s Fields.
 * @apiParam (Request Body) {string} message.content The message's content.
 *
 * @apiParam (Message Subject Options) internal `Cannot view story/scenario`
 * @apiParam (Message Subject Options) others `Others`
 * @apiParam (Message Subject Options) resource `Wrong episode story/scenario`
 *
 * @apiSuccess {boolean} ok JSON body of <Response.status>.ok.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "ok": true
 *  }
 */
export default class PostReportRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 120,
      id: 'report',
      max: 1,
      method: 'POST',
      route: [ '/report' ]
    });
  }

  public async exec (req: Request, res: Response) {
    const data = req.body;
    const usr = req.signedCookies.userId ? req.signedCookies.userId : req.ip;
    const interval = usr === req.ip ? 24 : 3;
    let user: IUser;

    if (req.signedCookies.userId) {
      [ user ] = await this.server.util.db('users').select([ 'userId', 'username' ])
        .where('userId', req.signedCookies.userId);

      if (!user)
        throw new ApiError(422, 'Invalid user.');
    }

    const [ recentlyReported ] = await this.server.util.db('reports').select('userId')
      .where({
        characterId: data.characterId,
        userId: usr
      })
      .andWhereRaw('DATE_ADD(date, INTERVAL :ss HOUR) > NOW()', { ss: interval })
      .limit(1);

    if (recentlyReported)
      throw new ApiError(429, 'Please wait before you submit another report.')
        .setRemaining(Date.now() - new Date(Number(recentlyReported.date) + (36e5 * interval)).valueOf());

    const recentReports: IReport[] = await this.server.util.db('reports').select('id')
      .where('userId', usr)
      .andWhereRaw('DATE_ADD(date, INTERVAL :ss HOUR) > NOW()', { ss: interval });

    if (recentReports.length > 5 && !this.server.auth.exempt.includes(req.signedCookies.userId))
      throw new ApiError(429, 'You already reached the max reports at the moment.');

    await this.server.util.db('reports')
      .insert({
        characterId: data.characterId,
        message: JSON.stringify(data.message),
        userId: usr
      });

    const ip = req.ip;
    const name = usr === ip ? `Anonymous User (${ip})` : `User ${user.username} (${user.userId})`;
    const character = this.server.kamihime.find(el => el.id === data.characterId);
    const channel = this.client.auth.discord.dbReportChannel;
    const types = {
      internal: 'Cannot view story/scenario',
      others: 'Others',
      resource: 'Wrong episode story/scenario'
    };

    await this.server.util.discordSend(channel, [
      `${name} from KamihimeDB reported that ${character.name}'s Episode has errors. Details:`,
      `Occurred at <${this.server.auth.urls.root}player/${character.id}/${data.episode}>`,
      '```x1',
      'Regarding: ' + types[data.message.subject],
      data.message.content,
      '```',
    ]);

    res
      .status(200)
      .json({ ok: true });
  }
}
