import { Request, Response } from 'express';
import Route from '../struct/Route';
import { createReadStream } from 'fs-extra';
import { resolve } from 'path';
import { promisify } from 'util';
import * as parseInfo from 'infobox-parser';

const IMAGES_PATH = resolve(__dirname, '../../static/img/wiki') + '/';
let getArticle: (...args: any[]) => Promise<string> = null;

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
    if (!getArticle)
      getArticle = promisify(this.client.wikiaClient.getArticle.bind(this.client.wikiaClient));

    const { id = null } = req.params;
    const { image = false, wiki: _wiki = true } = req.query;

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
      if (!_wiki) return res.render('info', { character });

      const wiki = await this._parseArticle(character.name);

      res.render('info', { character, wiki });
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }

  // -- Util

  /**
   * Parses infobox as JSON.
   * @param item The article to parse
   */
  protected async _parseArticle(item) {
    const rawData = await getArticle(item);
    const sanitisedData = data => {
      if (!data) throw { code: 404, message: `API returned no item named ${item} found.` };
      const slicedData = data.indexOf('==') === -1
        ? data
        : data.slice(data.indexOf('{{'), data.indexOf('=='));

      return slicedData
        .replace(/<br(?:| )(?:|\/)>/g, '\n')
        .replace(/<sup>(?:.+)<\/sup>/g, '')
        .replace(/(?:\{{2})(?:[^{}].*?)(?:\}{2})/g, '')
        .replace(/(?:\[{2}[\w#]+\|)(.*?)(?:\]{2})/g, '$1')
        .replace(/(?:\[{2})(?:[\w\s]+\(\w+\)\|)?([^:]*?)(?:\]{2})/g, '$1')
        .replace(/(?:\[{2}).*?(?:\]{2})/g, '');
    };

    const { general: info } = parseInfo(sanitisedData(rawData));
    info.name = info.name.replace(/(?:\[)(.+)(?:\])/g, '($1)');

    return info;
  }
}
