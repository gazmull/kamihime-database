import { Request, Response } from 'express';
import { IUser } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

/**
 * @api {get} /@me @me
 * @apiName GetAtMe
 * @apiGroup Site Specific
 * @apiDescription Retrieves site user's information.
 *
 * **Warning**: Requires cookies to be passed at headers.
 *
 * @apiParam (Query) {boolean} [save=true] Saves user info from cookies to database.
 *
 * @apiSuccess {string} settings The user's settings.
 * @apiSuccess {string} username The user's name.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "settings": {
 *      "audio": {
 *        "bgm": 0.1,
 *        "glo": 1.0,
 *        "snd": 0.5,
 *      },
 *      "lastNav": "#all",
 *      "menu": "true",
 *      "visual": {
 *        "bg": "rgb(255, 183, 183)",
 *        "cl": "rgb(190, 50, 74)",
 *      }
 *    },
 *    "username": "Euni"
 *  }
 */
export default class GetAtMeRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 3,
      id: '@me',
      max: 5,
      method: 'GET',
      route: [ '/@me' ]
    });
  }

  public async exec (req: Request, res: Response) {
    if (!req.signedCookies.userId) throw new ApiError(401);

    const [ user ]: IUser[] = await this.server.util.db('users')
      .select([ 'userId', 'username' ])
      .where('userId', req.signedCookies.userId)
      .limit(1);

    if (!user) throw new ApiError(404);

    const username = user.username;
    const settings = JSON.stringify({
      audio: req.cookies.settings.audio || {
        bgm: 0.1,
        glo: 1.0,
        snd: 0.5
      },
      lastNav: req.cookies.settings.lastNav || '#all',
      menu: req.cookies.settings.menu || true,
      updatedAt: req.cookies.settings.updatedAt || Date.now(),
      visual: req.cookies.settings.visual || {
        bg: '#997777',
        cl: '#ffffff',
        cls: '#dd55ff',
        containDialog: true,
        fontSize: 18
      }
    });

    if (req.query.save)
      await this.server.util.db('users').where('userId', user.userId)
        .update({ settings });

    res
      .json({ settings, username })
      .status(200);
  }
}
