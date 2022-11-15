import { Request, Response } from 'express';
import * as fs from 'fs-extra';
import { IKamihime } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

/**
 * @api {get} /dgif dgif
 * @apiName GetDgif
 * @apiGroup Site Specific
 * @apiDescription Download a character episode's h-GIFs in zip format
 * @apiPermission Donors Only
 */
export default class GetDgifRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'dgif',
      max: 1,
      method: 'GET',
      route: [ '/dgif/:id/:ep' ]
    });
  }

  public async exec (req: Request, res: Response) {
    if (!res.locals.user || !res.locals.user.donor)
      throw new ApiError(403, 'This, currently, is a donor-only feature.');

    const id = req.params.id;
    const ep = parseInt(req.params.ep);

    if (!id || !ep) throw new ApiError(400, 'ID and Episode is required.');
    if (![ 2, 3 ].includes(ep)) throw new ApiError(422, 'Not a valid episode.');

    const epKey = `harem${ep}resource2`;
    const [ character ]: IKamihime[] = await this.server.util.db('kamihime')
      .select([ 'id', 'name', 'rarity', epKey ])
      .where('id', id);

    if (!character) throw new ApiError(404);
    if (
      (ep === 1 && character.rarity === 'SKIN')
      || (ep === 3 && (id.charAt(0) !== 'k' || [ 'SSR+', 'R', 'SKIN' ].includes(character.rarity))
    ))
      throw new ApiError(422, 'Invalid episode for this character.');
    if (!character[epKey])
      throw new ApiError(501, [ 'Episode Resource is empty.', 'Please contact the administrator!' ]);

    const fileName = `${character.name}_${character[epKey]}.zip`;
    const filePath = `${this.server.auth.dirs.h.zips}${id}/${fileName}`;
    const fileStats = await fs.stat(filePath);

    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${character.name} Episode ${ep}.zip"`,
      'Content-Length': fileStats.size
    });

    const stream = fs.createReadStream(filePath);

    return stream.pipe(res);
  }
}
