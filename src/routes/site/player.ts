import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { IKamihime } from '../../../typings';
import Route from '../../struct/Route';
import ApiError from '../../util/ApiError';

const COOLDOWN = 1000 * 60 * 3;
const MAX_VISITS = 5;
const MAX_LOGGED_IN_VISITS = 10;

const SCENARIOS = 'https://device.kamihimedb.win/scenarios/';
const MISC = SCENARIOS + 'misc/';

export default class PlayerRoute extends Route {
  constructor () {
    super({
      id: 'player',
      method: 'get',
      route: [ '/player/:id/:ep/:type' ]
    });
  }

  public async exec (req: Request, res: Response) {
    const { id = null, type = null } = req.params;
    const ep = parseInt(req.params.ep);

    if (!(id || ep || type )) throw new ApiError(400, 'Incomplete query was given.');

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
      story3: 'harem3Resource1'
    };
    const selected = episodes[type + ep];

    if (!template || !selected)
      throw new ApiError(422, 'Invalid episode or player type.');

    const fields = [ 'id', 'name', 'rarity', 'peeks', selected ];
    const [ character ]: IKamihime[] = await this.server.util.db('kamihime').select(fields)
      .where('id', id);
    const resource = character[selected];

    if (ep === 3 && (id.charAt(0) !== 'k' || [ 'SSR+', 'R' ].includes(character.rarity)))
      throw new ApiError(422, 'Invalid episode for this character.');

    if (!character) throw new ApiError(404);
    if (!resource)
      throw new ApiError(501, [ 'Episode Resource is empty.', 'Please contact the administrator!' ]);

    await this._rateLimit(req, res, character, resource);

    const { scenario = null } = await this._find('script.json', id, resource);

    if (!template || !character || !scenario)
      throw new ApiError(501, 'Player type, character, or the scenario hash cannot be found.');

    let files: string[] = null;

    if (type !== 'story') {
      files = await this._find('files.rsc', id, resource, selected);

      if (!files)
        throw new ApiError(501, [
          'Episode Resource is unexpectedly empty.',
          'Please contact the administrator!',
        ]);
    }

    const requested = {
      SCENARIOS: `${SCENARIOS}${character.id}/${resource}/`,
      script: scenario,
      character: { id: character.id }
    };

    if (type === 'story')
      Object.assign(requested, { MISC });
    else
      Object.assign(requested, { files });

    res.render(template, requested);
  }

  // -- Util

  /**
   * Finds the file for requested episode.
   * @param name The name of the file
   * @param id The character ID
   * @param res The Resource ID for given template
   */
  protected async _find (name: string, id: string, res: string, rscKey?: string) {
    const filePath = `${SCENARIOS}${id}/${rscKey || res}/${name}`;

    try {
      const fetched = await fetch(filePath);

      if (!fetched.ok) throw false;

      const text = await fetched.text();

      if (name === 'files.rsc')
        return text.split(',');

      return JSON.parse(text);
    } catch (err) { return false; }
  }

  protected _checkRegistered (id: string, resource: string) {
    const _resource = this.server.stores.visitors.get(resource);
    if (!_resource) return false;

    const logged = _resource.get(id);
    if (!logged) return false;

    return true;
  }

  protected async _rateLimit (req: Request, res: Response, character: any, resource: string) {
    const update = () => this.server.util.db('kamihime').update('peeks', ++character.peeks)
      .where('id', character.id);
    const usr = req.signedCookies.userId || req.ip;
    const status = () => this.server.util.logger.info(`[A] Peek: ${usr} visited ${character.name}`);

    if (this.server.auth.exempt.includes(req.signedCookies.userId) || (res.locals.user && res.locals.user.donor)) {
      await update();
      status();

      return true;
    }

    const visitorVisits = this.server.stores.visitors.filter((timestamps, _resource) =>
      _resource !== resource && Date.now() < (timestamps.get(usr) + COOLDOWN)
    );

    const visitLimit = req.signedCookies.userId ? MAX_LOGGED_IN_VISITS : MAX_VISITS;
    if (visitorVisits.size >= visitLimit)
      throw new ApiError(429, `You may only do ${visitLimit} visits per 3 minutes.`);

    const currentRegistered = this._checkRegistered(usr, resource);
    if (!currentRegistered) {
      await update();

      const resourceLog = () => this.server.stores.visitors.get(resource);

      if (!resourceLog())
        this.server.stores.visitors.set(resource, this.server.util.collection());

      resourceLog().set(usr, Date.now());
      status();
    }

    return true;
  }
}
