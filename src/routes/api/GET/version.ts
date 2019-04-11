import { Response } from 'express';
import ApiRoute from '../../../struct/ApiRoute';

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
export default class GetRandomRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'version',
      max: 3,
      method: 'GET',
      route: [ '/version' ]
    });
  }

  public async exec (_, res: Response) {
    res
      .status(200)
      .json({ version: res.locals.app.version });
  }
}
