import { Response } from 'express';
// @ts-ignore
import { version } from '../../../package.json';
import Api from '../../struct/Api';

/**
 * @api {get} /version version
 * @apiName GetVersion
 * @apiGroup API Specific
 * @apiDescription Provides the current application's version.
 *
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "version": "2.0.0"
 *  }
 */
export default class GetRandomRequest extends Api {
  constructor () {
    super({
      cooldown: 5,
      max: 3,
      method: 'GET',
    });
  }

  public async exec (_, res: Response): Promise<void> {
    try {
      res
        .status(200)
        .json({ version });
    } catch (err) { this.util.handleApiError(res, err); }
  }
}
