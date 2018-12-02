import { each } from 'bluebird';
import { promisify } from 'util';
import { QueryBuilder } from 'knex';
import { WebhookClient, Message } from 'discord.js';
import * as logger from '../util/console';
import * as Wikia from 'nodemw';
import Server from './Server';

let getImageInfo: (...args: any[]) => any = null;
let getArticle: (...args: any[]) => string = null;
let khTimeout = null;

// Max calls and cooldown for scraping for each class (startKamihimeDatabase())
const COOLDOWN = 1000 * 60 * 20;
const API_MAX_CALLS = 100;

const slicedEntries = el => `+ ${el}`.slice(0, 68) + (el.length > 68 ? '...' : '');

export default class Client {
  constructor(server: Server) {
    this.server = server;

    this.wikiaClient = null;

    this.util = {
      logger: {
        status: (message: string) => logger.status(`Client: ${message}`),
        error: (message: string) => logger.error(`Client: ${message}`),
        warn: (message: string) => logger.warn(`Client: ${message}`)
      },
      webHookSend: (message: string) => new WebhookClient(this.server.auth.hook.id, this.server.auth.hook.token).send(message)
    };

    this.fields = ['id', 'name', 'avatar', 'element', 'rarity', 'type', 'tier', 'preview'];
  }

  server: Server;
  wikiaClient: Wikia;
  util: Util;
  fields: string[];

  init(): this {
    this.wikiaClient = new Wikia({
      protocol: 'https',
      server: 'kamihime-project.wikia.com',
      path: '',
      debug: false
    });

    getImageInfo = promisify(this.wikiaClient.getImageInfo.bind(this.wikiaClient));
    getArticle = promisify(this.wikiaClient.getArticle.bind(this.wikiaClient));

    this.util.logger.status('Initialised');

    return this;
  }

  /**
   * Calls add and update functions every time specified from COOLDOWN.
   * @param forced Whether the call is forced or not [can be forced thru server API (api/refresh)]
   */
  startKamihimeDatabase(forced: boolean = false): this {
    each(['x', 'w'], this._add.bind(this))
      .then(() => each(['s', 'e', 'k', 'w'], this._update.bind(this)))
      .then(() => this.util.logger.status('Refreshed Kamihime Database.'))
      .catch(this.util.logger.error);

    if (forced) {
      clearTimeout(khTimeout);
      khTimeout = setTimeout(() => this.startKamihimeDatabase(), COOLDOWN);
    }
    else
      khTimeout = setTimeout(() => this.startKamihimeDatabase(), COOLDOWN);

    return this;
  }

  /**
   * Adds items into the kamihime database.
   *
   * ---
   *
   * [1] Adds new weapons/eidolons
   *
   * [2] Inserts any missing values (e.g. avatar)
   * @param idPrefix The prefix of item type to refresh.
   */
  protected async _add(idPrefix: string): Promise<any> {
    this.util.logger.status('Kamihime Database: Started add...');

    try {
      const whereState = idPrefix === 'x' ? 'id LIKE \'x%\' or id LIKE \'e%\'' : `id LIKE '${idPrefix}%'`;
      const rows: any[] = await this.server.util.db('kamihime').select(this.fields)
        .whereRaw(whereState)
        .orderByRaw('CAST(substr(id, 2) AS INTEGER) DESC');
      const existing = rows.map(el => el.name);

      let id: string = null;
      let fileNameSuffix: string = null;

      switch (idPrefix) {
        case 'x':
          id = 'Eidolon';
          fileNameSuffix = '.png';
          break;
        case 'w':
          id = 'Weapon';
          fileNameSuffix = '.jpg';
          break;
        default:
          throw new Error('Invalid Prefix');
      }

      this.util.logger.status(`Kamihime Database: Adding ${id}...`);

      let result = await this._parseDatabase(id);
      result = result.filter(el => !existing.includes(el.name));

      if (!result.length) return this.util.logger.status(`Kamihime Database: ${id}: Nothing to add!`);

      let fromIndex = rows.length ? parseInt(rows.shift().id.slice(1)) + 1 : -1;
      const itemsAdded = [];
      let currentCalls = 0;

      for (const el of result) {
        if (currentCalls === API_MAX_CALLS) {
          this.util.logger.warn(`Max calls to Wiki API for ${id} has been reached`);

          break;
        }

        const newId: string = `${idPrefix}${++fromIndex}`;

        // -- Portrait

        let portraitName: string = idPrefix === 'x'
          ? el.name.replace(/ +/g, '')
          : el.name.replace(/ +/g, '_');
        portraitName = `File:${portraitName}Portrait${fileNameSuffix}`;
        let avatar = await getImageInfo(portraitName);

        if (avatar && avatar.url) avatar = avatar.url.split('/').slice(0, 8).join('/');
        else avatar = null;

        // -- Close

        let previewName =  el.name.replace(/ +/g, '_');
        previewName = `File:${previewName}${idPrefix !== 'w' ? 'Close' : ''}.png`;
        let preview = await getImageInfo(previewName);

        if (preview && preview.url) preview = preview.url.split('/').slice(0, 8).join('/');
        else preview = null;

        await this.server.util.db('kamihime')
        .insert({
          id: newId,
          name: el.name,
          rarity: el.rarity,
          element: el.element,
          type: el.type,
          avatar,
          preview,
          peeks: 0
        });

        itemsAdded.push(el.name);
        currentCalls++;
      }

      const length = itemsAdded.length;

      await this.util.webHookSend([
        `**Kamihime Database**: **${id}**: __Added ${length}__`,
        `\`\`\`diff`,
        itemsAdded.slice(0, 30).map(slicedEntries).join('\n'),
        length > 30 ? `- And ${length - 30} more... (See console logs)` : '',
        '```'
      ].join('\n'));

      return this.util.logger.status(`Kamihime Database: ${id}: Added ${length}: ${itemsAdded.join(', ')}`);
    } catch (err) { return this.util.logger.error(err); }
  }

  /**
   * Updates items from the kamihime database.
   * @param idPrefix The prefix of item type to refresh.
   */
  protected async _update(idPrefix: string): Promise<any> {
    this.util.logger.status('Kamihime Database: Started update...');

    try {
      let query: QueryBuilder = this.server.util.db('kamihime').select(this.fields)
        .whereRaw(`id LIKE '${idPrefix}%'`);
      query = idPrefix === 'e' ? query.andWhereRaw('id LIKE \'x%\'') : query;

      const rows: any[] = await query;

      let id: string = null;
      let fileNameSuffix: string = null;

      switch (idPrefix) {
        case 'x':
        case 'e':
        case 's':
        case 'k':
          id = {
            x: 'Eidolon',
            e: 'Eidolon',
            s: 'Soul',
            k: 'Kamihime'
          }[idPrefix];
          fileNameSuffix = '.png';
          break;
        case 'w':
          id = 'Weapon';
          fileNameSuffix = '.jpg';
          break;
        default:
          throw new Error('Invalid Prefix');
      }

      this.util.logger.status(`Kamihime Database: Updating ${id}...`);

      const result = await this._parseDatabase(id);
      const itemsUpdated = [];
      let currentCalls = 0;

      for (const el of result) {
        const info = rows.find(r => r.name === el.name);

        if (!info) continue;
        if (currentCalls === API_MAX_CALLS) {
          this.util.logger.warn(`Max calls to Wiki API for ${id} has been reached`);

          break;
        }

        const updateFields = {};
        const updateLength = () => Object.keys(updateFields).length;

        // -- Portrait

        if (!info.avatar) {
          let name: string = ['x', 'e', 's', 'k'].includes(idPrefix)
            ? el.name.replace(/ +/g, '')
            : el.name.replace(/ +/g, '_');
          name = `File:${name}Portrait${fileNameSuffix}`;
          let avatar = await getImageInfo(name);

          if (avatar && avatar.url) {
            avatar = avatar.url.split('/').slice(0, 8).join('/');

            Object.assign(updateFields, { avatar });
          }
        }

        // -- Close

        if (!info.preview) {
          let name = idPrefix === 's'
            ? el.name.replace(/ +/g, '')
            : el.name.replace(/ +/g, '_');
          name = `File:${name}${idPrefix !== 'w' ? 'Close' : ''}.png`;
          let preview = await getImageInfo(name);

          if (preview && preview.url) {
            preview = preview.url.split('/').slice(0, 8).join('/');

            Object.assign(updateFields, { preview });
          }
        }

        if (el.rarity && info.rarity !== el.rarity)
          Object.assign(updateFields, { rarity: el.rarity });

        if (el.tier && info.tier !== el.tier)
          Object.assign(updateFields, { tier: el.tier });

        if (el.element && !el.tier && info.element !== el.element)
          Object.assign(updateFields, { element: el.element.includes(';') ? 'Varies' : el.element });

        if (el.type && info.type !== el.type)
          Object.assign(updateFields, { type: el.type });

        if (!updateLength()) continue;

        await this.server.util.db('kamihime')
          .update(updateFields)
          .where('name', el.name);

        itemsUpdated.push(`${el.name}: ${Object.keys(updateFields).join(', ')}`);
        currentCalls++;
      }

      const length = itemsUpdated.length;

      if (!length) return this.util.logger.status(`Kamihime Database: ${id}: Nothing to update!`);

      await this.util.webHookSend([
        `**Kamihime Database**: **${id}**: __Updated ${length}__`,
        `\`\`\`diff`,
        itemsUpdated.slice(0, 30).map(slicedEntries).join('\n'),
        length > 30 ? `- And ${length - 30} more... (See console logs)` : '',
        '```'
      ].join('\n'));

      return this.util.logger.status(`Kamihime Database: ${id}: Updated ${length}: ${itemsUpdated.join(', ')}`);
    } catch (err) { return this.util.logger.error(err); }
  }

  // -- Utitlities

  /**
   * Parses article database to internal useable (e.g. array of items)
   * @param item The item article to parse
   */
  protected async _parseDatabase(item: string): Promise<any> {
    const data = await getArticle(`Module:${item} Database`);

    if (!data) throw `API returned no item name ${item} found.`;

    return JSON.parse(data
      .replace(/.+\s.+?= {/, '[')
      .replace(/,?\s+?}\s+?.+$/, ']')
      .replace(/({|,\s?)([\w]+?)(=["\d])/g, '$1"$2"$3')
      .replace(/=/g, ':'));
  }
}

interface Util {
  logger: {
    status: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
  };
  webHookSend: (message: string) => Promise<Message | Message[]>;
}
