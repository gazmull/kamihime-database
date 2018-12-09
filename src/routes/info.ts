import { Request, Response } from 'express';
import Route from '../struct/Route';
import { createReadStream } from 'fs-extra';
import { resolve } from 'path';

const IMAGES_PATH = resolve(__dirname, '../../static/img/wiki') + '/';

export = InfoRoute;
class InfoRoute extends Route {
  constructor() {
    super({
      id: 'info',
      method: 'get',
      route: ['/info/:id']
    });
  }

  async exec(req: Request, res: Response): Promise<any> {
    const { id = null } = req.params;
    const { image = false} = req.query;

    try {
      if (!id) throw { code: 403, message: 'ID is empty.' };

      const character = this.server.kamihimeCache.find(el => el.id === id);

      if (!character) throw { code: 404 };
      if (image) {
        const requested = character[image];

        if (!requested)
          throw {
            code: 404,
            message: [
              'Cannot retrieve image.',
              'Value must be main, preview, or avatar'
            ]
          };

        const img = createReadStream(IMAGES_PATH + requested);

        img.on('error', err => {
          this.server.util.logger.error(err);

          throw { message: 'There was a problem streaming the image.' };
        });
        res.setHeader('Content-Type', 'image/png');

        return img.pipe(res);
      }

      res.render('info', { character });
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
