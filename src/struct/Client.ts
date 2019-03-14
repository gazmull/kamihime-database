import anchorme from 'anchorme';
import { each } from 'bluebird';
import { Client as DiscordClient, Message, TextChannel, WSEventType } from 'discord.js';
import { createWriteStream } from 'fs-extra';
import { QueryBuilder } from 'knex';
import fetch from 'node-fetch';
import * as Wikia from 'nodemw';
import { resolve } from 'path';
import { promisify } from 'util';
import { IClientAuth, IKamihime, IUtil } from '../../typings';
import { discordClient as discordAuth } from '../auth/auth';
import Server from './Server';

let getImageInfo: (...args: any[]) => any = null;
let getArticle: (...args: any[]) => string = null;
let khTimeout: NodeJS.Timeout = null;

// Max calls and cooldown for scraping for each class (startKamihimeDatabase())
const COOLDOWN = 1000 * 60 * 60;
const API_MAX_CALLS = 50;

const IMAGES_PATH = resolve(__dirname, '../../static/img/wiki') + '/';

const slicedEntries = el => `+ ${el}`.slice(0, 68) + (el.length > 68 ? '...' : '');
const clean = url => url.split('/').slice(0, 8).join('/');
const escape = (name: string) => name.replace(/'/g, '\'\'');

export default class Client {
  constructor (server: Server) {
    this.server = server;

    this.wikiaClient = null;

    this.discordClient = null;

    this.auth = { discord: discordAuth };

    this.util = {
      ...this.server.util,
      discordSend: (channelId, message) => {
        const channel = this.discordClient.channels.get(channelId) as TextChannel;

        if (!channel) return this.util.logger.warn(`Channel ${channelId} does not exist.`);

        return channel.send(message);
      },
    };

    this.fields = [ 'id', 'name', 'avatar', 'element', 'rarity', 'type', 'tier', 'main', 'preview' ];
  }

  public server: Server;
  public wikiaClient: Wikia;
  public discordClient: DiscordClient;
  public auth: IClientAuth;
  public util: IUtil;
  public fields: string[];

  public init () {
    this.wikiaClient = new Wikia({
      debug: false,
      path: '',
      protocol: 'https',
      server: 'kamihime-project.wikia.com',
    });

    getImageInfo = promisify(this.wikiaClient.getImageInfo.bind(this.wikiaClient));
    getArticle = promisify(this.wikiaClient.getArticle.bind(this.wikiaClient));

    this.util.logger.info('Client: Initialised');

    return this;
  }

  public startDiscordClient () {
    if (!(discordAuth.channel || discordAuth.token)) return;

    const events: WSEventType[] = [
      'GUILD_UPDATE',
      'GUILD_INTEGRATIONS_UPDATE',
      'CHANNEL_CREATE',
      'CHANNEL_UPDATE',
      'USER_UPDATE',
      'PRESENCE_UPDATE',
      'VOICE_STATE_UPDATE',
      'TYPING_START',
      'WEBHOOKS_UPDATE',
    ];
    const rootURL = this.server.auth.rootURL;
    const hostname = rootURL.slice(rootURL.indexOf(':') + 3).slice(0, -1);

    this.discordClient = new DiscordClient({
      disabledEvents: events,
      presence: {
        activity: {
          name: hostname,
          type: 'WATCHING',
        },
        status: 'online',
      },
    });

    const handleMessage = async (message: Message) => {
      if (message.channel.id !== discordAuth.channel) return;
      if (!this.server.auth.exempt.includes(message.author.id)) return;

      const msg = anchorme(message.content, { attributes: [ { name: 'target', value: '_blank' } ] });

      try {
        await this.util.db('status').del();
        await this.util.db('status').insert({
          id: message.id,
          message: msg,
        });

        this.server.status = msg;
      } catch (e) { this.util.logger.error(e); }

      this.util.logger.info('Discord Bot: New announcement has been saved.');
    };

    this.discordClient
      .on('ready', () => this.util.logger.info('Discord Bot: logged in.'))
      .on('error', this.util.logger.error)
      .on('message', handleMessage)
      .on('messageUpdate', (_, newMessage) => handleMessage(newMessage))
      .login(discordAuth.token);

    return this;
  }

  /**
   * Calls add and update functions every time specified from COOLDOWN.
   * @param forced Whether the call is forced or not [can be forced thru server API (api/refresh)]
   */
  public startKamihimeDatabase (forced: boolean = false) {
    this.util.logger.info('Kamihime Database: [ADD] Start');
    each([ 'x', 'w' ], this._add.bind(this))
      .then(() => {
        this.util.logger.info('Kamihime Database: [ADD] End');
        this.util.logger.info('Kamihime Database: [UPDATE] Start');

        return each([ 's', 'e', 'k', 'w' ], this._update.bind(this));
      })
      .then(() => {
        this.util.logger.info('Kamihime Database: [UPDATE] End');

        return this.util.logger.info('Refreshed Kamihime Database.');
      })
      .catch(this.util.logger.error);

    if (forced) {
      clearTimeout(khTimeout);
      khTimeout = setTimeout(() => this.startKamihimeDatabase(), COOLDOWN);
    } else
      khTimeout = setTimeout(() => this.startKamihimeDatabase(), COOLDOWN);

    return this;
  }

  /**
   * Adds items into the kamihime database.
   * @param idPrefix The prefix of item type to refresh.
   */
  protected async _add (idPrefix: string) {
    try {
      const whereState = idPrefix === 'x' ? 'id LIKE \'x%\' or id LIKE \'e%\'' : `id LIKE '${idPrefix}%'`;
      const rows: IKamihime[] = await this.util.db('kamihime').select(this.fields)
        .whereRaw(whereState)
        .orderByRaw('CAST(substr(id, 2) AS DECIMAL) DESC');
      const existing = rows.map(el => el.name.toLowerCase());

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

      this.util.logger.info(`Kamihime Database: [ADDING] ${id}...`);

      let result: IKamihime[] = await this._parseDatabase(id);
      result = result.filter(el => !existing.includes(el.name.toLowerCase()));

      if (!result.length) return this.util.logger.info(`Kamihime Database: [ADD SKIPPED] ${id}`);

      let fromIndex = rows.length ? parseInt(rows[0].id.slice(1)) + 1 : -1;
      const itemsAdded = [];
      let currentCalls = 0;

      for (const el of result) {
        const checkCall: () => boolean = () => {
          if (currentCalls === API_MAX_CALLS) {
            this.util.logger.warn(`Kamihime Database: [RATE LIMITED] ${id}`);

            return true;
          }

          return false;
        };

        const newId = `${idPrefix}${++fromIndex}`;

        // -- Portrait

        const portraitName = `File:${el.name} Portrait${fileNameSuffix}`;
        let avatar = await getImageInfo(portraitName);

        if (avatar && avatar.url) {
          avatar = await fetch(clean(avatar.url));
          avatar = await avatar.buffer();
          const path = `portrait/${el.name} Portrait${fileNameSuffix}`;

          const stream = createWriteStream(IMAGES_PATH + path, { encoding: 'binary' });

          stream.write(avatar, err => {
            if (err) this.util.logger.error(err.message);
          });
          stream.end();

          avatar = path;
        }
        else avatar = null;

        // -- Close

        let preview = null;
        if (idPrefix !== 'w') {
          const previewName = `File:${el.name} Close.png`;
          preview = await getImageInfo(previewName);

          if (preview && preview.url) {
            preview = await fetch(clean(preview.url));
            preview = await preview.buffer();
            const path = `close/${el.name} Close.png`;

            const stream = createWriteStream(IMAGES_PATH + path, { encoding: 'binary' });

            stream.write(preview, err => {
              if (err) this.util.logger.error(err.message);
            });
            stream.end();

            preview = path;
          }
          else preview = null;
        }

        // -- Main

        const mainName = `File:${el.name}.png`;
        let main = await getImageInfo(mainName);

        if (main && main.url) {
          main = await fetch(clean(main.url));
          main = await main.buffer();
          const path = `main/${el.name}.png`;

          const stream = createWriteStream(IMAGES_PATH + path, { encoding: 'binary' });

          stream.write(main, err => {
            if (err) this.util.logger.error(err.message);
          });
          stream.end();

          main = path;
        }
        else main = null;

        await this.util.db('kamihime')
        .insert({
          avatar,
          main,
          preview,
          element: el.element,
          id: newId,
          name: clean(el.name),
          peeks: 0,
          rarity: el.rarity,
          type: el.type,
        });

        itemsAdded.push(el.name);
        currentCalls++;

        if (checkCall()) break;
      }

      const length = itemsAdded.length;

      await this.util.discordSend(this.auth.discord.wikiReportChannel, [
        `**Kamihime Database**: **${id}**: __Added ${length}__`,
        `\`\`\`diff`,
        itemsAdded.slice(0, 30).map(slicedEntries).join('\n'),
        length > 30 ? `- And ${length - 30} more... (See console logs)` : '',
        '```',
      ].join('\n'));

      return this.util.logger.info(`Kamihime Database: [ADDED] ${id} (${length}): ${itemsAdded.join(', ')}`);
    } catch (err) { return this.util.logger.error(err); }
  }

  /**
   * Updates items from the kamihime database.
   * @param idPrefix The prefix of item type to refresh.
   */
  protected async _update (idPrefix: string) {
    try {
      let query: QueryBuilder = this.util.db('kamihime').select(this.fields)
        .whereRaw(`id LIKE '${idPrefix}%'`);
      query = idPrefix === 'e' ? query.orWhereRaw('id LIKE \'x%\'') : query;

      const rows: any[] = await query;

      let id: string = null;
      let fileNameSuffix: string = null;

      switch (idPrefix) {
        case 'e':
        case 's':
        case 'k':
          id = {
            e: 'Eidolon',
            k: 'Kamihime',
            s: 'Soul',
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

      this.util.logger.info(`Kamihime Database: [UPDATING] ${id}...`);

      const result = await this._parseDatabase(id);
      const itemsUpdated = [];
      let currentCalls = 0;

      for (const el of result) {
        const info = rows.find(r => r.name === el.name);

        if (!info) continue;
        const checkCall: () => boolean = () => {
          if (currentCalls === API_MAX_CALLS) {
            this.util.logger.warn(`Kamihime Database: [RATE LIMITED] ${id}`);

            return true;
          }

          return false;
        };

        const updateFields = {};

        // -- Portrait

        if (!info.avatar) {
          const name = `File:${el.name} Portrait${fileNameSuffix}`;
          let avatar = await getImageInfo(name);

          if (avatar && avatar.url) {
            avatar = await fetch(clean(avatar.url));
            avatar = await avatar.buffer();
            const path = `portrait/${el.name} Portrait${fileNameSuffix}`;

            const stream = createWriteStream(IMAGES_PATH + path, { encoding: 'binary' });

            stream.write(avatar, err => {
              if (err) this.util.logger.error(err.message);
            });
            stream.end();

            avatar = path;

            Object.assign(updateFields, { avatar });
          }
        }

        // -- Close

        if (!info.preview && idPrefix !== 'w') {
          const name = `File:${el.name} Close.png`;
          let preview = await getImageInfo(name);

          if (preview && preview.url) {
            preview = await fetch(clean(preview.url));
            preview = await preview.buffer();
            const path = `close/${el.name} Close.png`;

            const stream = createWriteStream(IMAGES_PATH + path, { encoding: 'binary' });

            stream.write(preview, err => {
              if (err) this.util.logger.error(err.message);
            });
            stream.end();

            preview = path;

            Object.assign(updateFields, { preview });
          }
        }

        // -- Main

        if (!info.main) {
          const name = `File:${el.name}.png`;
          let main = await getImageInfo(name);

          if (main && main.url) {
            main = await fetch(clean(main.url));
            main = await main.buffer();
            const path = `main/${el.name}.png`;

            const stream = createWriteStream(IMAGES_PATH + path, { encoding: 'binary' });

            stream.write(main, err => {
              if (err) this.util.logger.error(err.message);
            });
            stream.end();

            main = path;

            Object.assign(updateFields, { main });
          }
        }

        if (el.rarity && info.rarity !== el.rarity)
          Object.assign(updateFields, { rarity: el.rarity });

        if (el.tier && info.tier !== el.tier)
          Object.assign(updateFields, { tier: el.tier });

        if (el.element && !el.tier && info.element !== 'Varies' && info.element !== el.element)
          Object.assign(updateFields, { element: el.element.includes(';') ? 'Varies' : el.element });

        if (el.type && info.type !== el.type)
          Object.assign(updateFields, { type: el.type });

        if (!Object.keys(updateFields).length) continue;

        const nRarityRegex = / \(N\)/;
        const testedRarity = nRarityRegex.test(el.name);
        const shouldIncludeLowerRarity = testedRarity
          ? `name = '${escape(el.name)}' OR name = '${escape(el.name).replace(nRarityRegex, '')}'`
          : `name = '${escape(el.name)}'`;

        await this.util.db('kamihime')
          .update(updateFields)
          .whereRaw(shouldIncludeLowerRarity);

        itemsUpdated.push(`${el.name}: ${Object.keys(updateFields).join(', ')}`);
        currentCalls++;

        if (checkCall()) break;
      }

      const length = itemsUpdated.length;

      if (!length) return this.util.logger.info(`Kamihime Database: [UPDATE SKIPPED] ${id}`);

      await this.util.discordSend(this.auth.discord.wikiReportChannel, [
        `**Kamihime Database**: **${id}**: __Updated ${length}__`,
        `\`\`\`diff`,
        itemsUpdated.slice(0, 30).map(slicedEntries).join('\n'),
        length > 30 ? `- And ${length - 30} more... (See console logs)` : '',
        '```',
      ].join('\n'));

      return this.util.logger.info(`Kamihime Database: [UPDATED] ${id} (${length}): ${itemsUpdated.join(', ')}`);
    } catch (err) { return this.util.logger.error(err); }
  }

  // -- Utitlities

  /**
   * Parses article database to internal useable (e.g. array of items)
   * @param item The item article to parse
   */
  protected async _parseDatabase (item: string) {
    const data = await getArticle(`Module:${item} Database`);

    if (!data) throw new Error(`API returned no item name ${item} found.`);

    return JSON.parse(data
      .replace(/.+\s.+?= {/, '[')
      .replace(/,?\s+?}\s+?.+$/, ']')
      .replace(/({|,\s?)([\w]+?)(=["\d])/g, '$1"$2"$3')
      .replace(/=/g, ':'));
  }
}
