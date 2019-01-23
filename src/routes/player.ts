import { Request, Response } from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import Route from '../struct/Route';

const COOLDOWN = 1000 * 60 * 3;
const MAX_VISITS = 5;
const MAX_LOGGED_IN_VISITS = 10;

const SCENARIOS = 'https://cf.static.r.kamihimeproject.dmmgames.com/scenarios/';
const BG_IMAGE = SCENARIOS + 'bgimage/';
const BGM = SCENARIOS + 'bgm/';
const FG_IMAGE = SCENARIOS + 'fgimage/';

export default class PlayerRoute extends Route {
  constructor () {
    super({
      id: 'player',
      method: 'get',
      route: [ '/player/:id/:ep/:type' ],
    });
  }

  public async exec (req: Request, res: Response): Promise<void> {
    const { id = null, type = null } = req.params;
    const ep = parseInt(req.params.ep);

    try {
      if (!(id || ep || type )) throw { code: 422, message: 'Incomplete query was given.' };

      const template = type === 'story'
        ? 'player/story'
        : type === 'scenario'
          ? 'player/scenario'
          : type === 'legacy'
            ? 'player/legacy'
            : null;
      const episodes = {
        legacy2: 'harem2Resource2',
        legacy3: 'harem3Resource2',
        scenario2: 'harem2Resource2',
        scenario3: 'harem3Resource2',
        story1: 'harem1Resource1',
        story2: 'harem2Resource1',
        story3: 'harem3Resource1',
      };
      const selected = episodes[type + ep];

      if (!template || !selected)
        throw { code: 422, message: 'Invalid episode or player type.' };

      let fields = [ 'id', 'name', 'rarity', 'peeks' ];
      fields = fields.concat([ selected, `harem${ep}Title` ]);

      const [ character ]: IKamihime[] = await this.util.db('kamihime').select(fields)
        .where('id', id);
      const resource = character[selected];

      if (ep === 3 && (id.charAt(0) !== 'k' || [ 'SSR+', 'R' ].includes(character.rarity)))
        throw { code: 422, message: 'Invalid episode for this character.' };

      if (!character) throw { code: 404 };
      if (!resource)
        throw { code: 404, message: [ 'Episode Resource is empty.', 'Please contact the administrator!' ] };

      await this._rateLimit(req, character, resource);

      const { scenario = null } = await this._find('script.json', id, resource);

      if (!template || !character || !scenario) throw { code: 404 };

      let files: string[] = null;

      if (type !== 'story') {
        files = await this._find('files.rsc', id, resource);

        if (!files)
          throw {
            code: 404,
            message: [
            'Episode Resource is unexpectedly empty.',
            'Please contact the administrator!',
          ],
        };
      }

      let folder = resource.slice(-4);
      const fLen = folder.length / 2;
      folder = `${folder.slice(0, fLen)}/${folder.slice(fLen)}/`;
      const requested = {
        SCENARIOS: `${SCENARIOS + folder}${resource}/`,
        script: scenario,
      };

      if (type === 'story')
        Object.assign(requested, { BG_IMAGE, BGM, FG_IMAGE });
      else
        Object.assign(requested, { files });

      res.render(template, requested);
    } catch (err) { this.util.handleSiteError(res, err); }
  }

  // -- Util

  /**
   * Finds the file for requested episode.
   * @param name The name of the file
   * @param id The character ID
   * @param res The Resource ID for given template
   */
  protected async _find (name: string, id: string, res: string): Promise<any> {
    const filePath = path.resolve(__dirname, '../../static/scenarios', id, res, name);

    try {
      const file = await fs.readFile(filePath);

      if (name === 'files.rsc')
        return file.toString().split(',');

      return JSON.parse(file.toString());
    } catch (err) { return false; }
  }

  protected _checkRegistered (id: string, resource: string): boolean {
    const _resource = this.server.visitors.get(resource);
    if (!_resource) return false;

    const logged = _resource.get(id);
    if (!logged) return false;

    return true;
  }

  protected async _rateLimit (req: Request, character: any, resource: string): Promise<true> {
    const update = () => this.util.db('kamihime').update('peeks', ++character.peeks)
      .where('id', character.id);
    const usr = req.signedCookies.userId || req.ip;
    const status = () => this.util.logger.status(`[A] Peek: ${usr} visited ${character.name}`);

    if (this.server.auth.exempt.includes(req.signedCookies.userId)) {
      await update();
      status();

      return true;
    }

    const visitorVisits = this.server.visitors.filter((timestamps, _resource) =>
      _resource !== resource && Date.now() < (timestamps.get(usr) + COOLDOWN),
    );

    const visitLimit = req.signedCookies.userId ? MAX_LOGGED_IN_VISITS : MAX_VISITS;
    if (visitorVisits.size >= visitLimit)
      throw { code: 429, message: `You may only do ${visitLimit} visits per 3 minutes.` };

    const currentRegistered = this._checkRegistered(usr, resource);
    if (!currentRegistered) {
      await update();

      const resourceLog = () => this.server.visitors.get(resource);

      if (!resourceLog())
        this.server.visitors.set(resource, this.util.collection());

      resourceLog().set(usr, Date.now());
      status();
    }

    return true;
  }
}
