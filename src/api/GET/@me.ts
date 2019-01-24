import { Request, Response } from 'express';
import Api from '../../struct/Api';

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
 *      "info-lastNav": "#info",
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
export default class GetAtMeRequest extends Api {
  constructor () {
    super({
      cooldown: 3,
      max: 5,
      method: 'GET',
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    try {
      if (!req.signedCookies.userId) throw { code: 401 };

      const [ user ]: IUser[] = await this.util.db('users')
        .select([ 'userId', 'username' ])
        .where('userId', req.signedCookies.userId)
        .limit(1);

      if (!user) throw { code: 404 };

      const username = user.username;
      const settings = JSON.stringify({
        audio: req.cookies.audio && Object.keys(req.cookies.audio).length
          ? req.cookies.audio
          : {
          bgm: 0.1,
          glo: 1.0,
          snd: 0.5,
        },
        'info-lastNav': req.cookies['info-lastNav'] || '#info',
        lastNav: req.cookies.lastNav || '#all',
        menu: req.cookies.menu || true,
        visual: req.cookies.visual && Object.keys(req.cookies.visual).length
          ? req.cookies.visual
          : {
          bg: '#997777',
          cl: '#ffffff',
          cls: '#dd55ff',
          containDialog: true,
          fontSize: 18,
        },
      });

      if (req.query.save)
        await this.util.db('users').where('userId', user.userId)
          .update({ settings });

      res
        .json({ settings, username })
        .status(200);
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
