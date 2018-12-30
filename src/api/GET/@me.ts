import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Api from '../../struct/Api';

/**
 * @api {get} /@me @me
 * @apiVersion 2.1.0
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
      if (!req.cookies.userId) throw { code: 403 };

      const [ user ]: IUser[] = await this.util.db('users')
        .select([ 'userId', 'username', 'refreshToken', 'expiration' ])
        .where('userId', req.cookies.userId)
        .limit(1);

      if (!user) throw { code: 403 };

      const timeLapsed = Date.now() - new Date(user.expiration).getTime();
      const expired = timeLapsed > 6048e5;
      let username: string;

      if (expired) {
        const discord = this.server.auth.discord;
        const credentials = Buffer.from(`${discord.key}:${discord.secret}`).toString('base64');
        const url = [
          'https://discordapp.com/api/oauth2/token?',
          'grant_type=refresh_token',
          'refresh_token=' + user.refreshToken,
          '&redirect_uri=' + this.server.auth.rootURL + discord.callback,
          '&scope=identify',
        ].join('');

        const _response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            Authorization: 'Basic ' + credentials,
          },
          method: 'POST',
        });
        const response = await _response.json();

        const _user = await fetch('https://discordapp.com/api/users/@me', {
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + response.access_token,
          },
        });
        const newUser = await _user.json();
        username = newUser.username;

        await this.util.db.raw([
          'UPDATE users SET',
          'expiration=date_add(now(), interval 7 DAY),',
          `username='${user}'`,
          `WHERE userId='${newUser.id}'`,
        ].join(' '));
      } else username = user.username;

      const settings = JSON.stringify({
        audio: req.cookies.audio && Object.keys(JSON.parse(req.cookies.audio)).length
          ? JSON.parse(req.cookies.audio)
          : {
          bgm: 0.1,
          glo: 1.0,
          snd: 0.5,
        },
        'info-lastNav': req.cookies['info-lastNav'] || '#info',
        lastNav: req.cookies.lastNav || '#all',
        menu: req.cookies.menu || true,
        visual: req.cookies.visual && Object.keys(JSON.parse(req.cookies.visual)).length
          ? JSON.parse(req.cookies.visual)
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
