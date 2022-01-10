import { Response } from 'express';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

/**
 * @api {get} /refresh refresh
 * @apiName GetRefresh
 * @apiGroup API Specific
 * @apiDescription Forcefully refreshes server cache (Character list)
 * @apiPermission Owner Only
 *
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "ok": true
 *  }
 */
export default class GetRefreshRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'refresh',
      max: 1,
      method: 'GET',
      route: [ '/refresh' ]
    });
  }

  public async exec (_, res: Response) {
    if (!res.locals.user.admin)
      throw new ApiError(401);

    await this.server.startKamihimeCache(true);

    res
      .status(200)
      .json({ ok: true });
  }
}
