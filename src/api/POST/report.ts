import { Request, Response } from 'express';
import Api from '../../struct/Api';

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
 * @apiParam (Request Body) {number} type The type of the report.
 * <br>0 for `Wiki Info` report<br>1 for `Episodes` report
 *
 * @apiParam (Message Subject Options - Wiki Info) ability `Wrong abilities`
 * @apiParam (Message Subject Options - Wiki Info) image `Image issues`
 * @apiParam (Message Subject Options - Wiki Info) info `Wrong brief info (first table)`
 * @apiParam (Message Subject Options - Wiki Info) internal `Info cannot be resolved`
 * @apiParam (Message Subject Options - Wiki Info) notes `Needs additional/wrong notes`
 * @apiParam (Message Subject Options - Wiki Info) others `Others`
 * @apiParam (Message Subject Options - Wiki Info) stats `Wrong stats`
 *
 * @apiParam (Message Subject Options - Episodes) internal `Cannot view story/scenario`
 * @apiParam (Message Subject Options - Episodes) others `Others`
 * @apiParam (Message Subject Options - Episodes) resource `Wrong episode story/scenario`
 * @apiParam (Message Subject Options - Episodes) title `Wrong episode title`
 *
 * @apiSuccess {string} ok JSON body of <Response.status>.ok.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "ok": ""
 *  }
 */
export default class PostReportRequest extends Api {
  constructor () {
    super({
      cooldown: 120,
      max: 1,
      method: 'POST',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const data = req.body;
    const usr = req.cookies.userId ? req.cookies.userId : req.ip;
    const interval = usr === req.ip ? 24 : 3;
    let user: IUser;

    try {
      if (req.cookies.userId) {
        [ user ] = await this.util.db('users').select([ 'userId', 'username' ])
          .where('userId', req.cookies.userId);

        if (!user)
          throw { code: 401, message: 'Invalid user.' };
      }

      const [ recentlyReported ] = await this.util.db('reports').select('userId')
        .where({
          characterId: data.characterId,
          type: data.type,
          userId: usr,
        })
        .andWhereRaw('DATE_ADD(date, INTERVAL :ss HOUR) > NOW()', { ss: interval })
        .limit(1);

      if (recentlyReported)
        throw { code: 429, message: 'Please wait before you submit another report.' };

      const recentReports: IReport[] = await this.util.db('reports').select('id')
        .where('userId', usr)
        .andWhereRaw('DATE_ADD(date, INTERVAL :ss HOUR) > NOW()', { ss: interval });

      if (recentReports.length > 5 && !this.server.auth.exempt.includes(req.cookies.userId))
        throw { code: 429, message: 'You are limited from reporting.' };

      await this.util.db('reports')
        .insert({
          characterId: data.characterId,
          message: JSON.stringify(data.message),
          type: data.type,
          userId: usr,
        });

      const name = usr === req.ip ? `Anonymous User (${req.ip})` : `User ${user.username} (${user.userId})`;
      const character = this.server.kamihime.find(el => el.id === data.characterId);
      const channel = data.type === 0
        ? this.client.auth.discord.wikiReportChannel
        : this.client.auth.discord.dbReportChannel;
      const type = data.type === 0 ? 'Wiki Info' : 'Episodes';
      const types = [
        {
          ability: 'Wrong abilities',
          image: 'Image issues',
          info: 'Wrong brief info (first table)',
          internal: 'Info cannot be resolved',
          notes: 'Needs additional/wrong notes',
          others: 'Others',
          stats: 'Wrong stats',
        },
        {
          internal: 'Cannot view story/scenario',
          others: 'Others',
          resource: 'Wrong episode story/scenario',
          title: 'Wrong episode title',
        },
      ];

      await this.util.discordSend(channel, [
        `${name} from KamihimeDB reported that ${character.name}'s ${type} has errors. Details:`,
        `Occurred at <${this.server.auth.rootURL}info/${character.id}>`,
        '```x1',
        'Regarding: ' + types[data.type][data.message.subject],
        data.message.content,
        '```',
      ]);

      res
        .status(200)
        .json({ ok: '' });
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
