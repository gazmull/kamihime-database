import { Request, Response } from 'express';
import * as parseInfo from 'infobox-parser';
import { promisify } from 'util';
import Route from '../struct/Route';

let getArticle: (...args: any[]) => Promise<string> = null;

export default class InfoRoute extends Route {
  constructor () {
    super({
      id: 'info',
      method: 'get',
      route: [ '/info/:id' ],
    });
  }

  public async exec (req: Request, res: Response): Promise<any> {
    if (!getArticle)
      getArticle = promisify(this.client.wikiaClient.getArticle.bind(this.client.wikiaClient));

    const { id = null } = req.params;

    try {
      if (!id) throw { code: 403, message: 'ID is empty.' };

      const character = id === 'random' ? await this._getRandom() : this.server.kamihime.find(el => el.id === id);

      if (!character) throw { code: 422 };
      else if ((character as any).error) throw { code: 404 };

      const requested = { character, wiki: null };

      this._parseArticle(character.name)
      .then(wiki => {
        requested.wiki = wiki;

        return res.render('info/info', requested);
      })
      .catch(() => res.render('info/info', requested));
    } catch (err) { this.util.handleSiteError(res, err); }
  }

  // -- Util

  protected _getRandom () {
    return fetch(this.server.auth.api.url + 'random', { headers: { Accept: 'application/json' } })
      .then(res => res.json() as Promise<IKamihime>);
  }

  /**
   * Parses infobox as JSON.
   * @param item The article to parse
   */
  protected async _parseArticle (item) {
    const raw: string = await getArticle(item);
    const sanitisedData = (data: string) => {
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
        .replace(/(?:\[{2}).*?(?:\]{2})/g, '')
        .replace(/ {2}/g, ' ');
    };
    const getNotes = (data: string) => {
      const header = '== Notes ==';

      if (!data.includes(header)) return null;

      let slicedData = data.slice(data.indexOf(header) + 11);
      slicedData = slicedData.slice(0, slicedData.indexOf('=='));

      slicedData = slicedData
        .replace(/(?:\{{2})(?:[^{}].*?)(?:\}{2})/g, '')
        .replace(/(?:\[{2})(?:[\w\s]+\(\w+\)\|)?([^:]*?)(?:\]{2})/g, '$1')
        .replace(/(?:\[{2}).*?(?:\]{2})/g, '')
        .replace(/ {2}/g, ' ')
        .replace(/\n+/g, '')
        .replace(/(\*{2,})/g, e => `\n${' '.repeat(e.length + 2)}- `)
        .replace(/'{3}(.*?)'{3}/g, '<b>$1</b>');

      const [ , ...result ] = slicedData.split('*');

      return result;
    };

    const { general: info } = parseInfo(sanitisedData(raw));
    info.name = info.name.replace(/(?:\[)(.+)(?:\])/g, '($1)');

    const notes = getNotes(raw);

    if (notes)
      info.notes = notes;

    return info;
  }
}
