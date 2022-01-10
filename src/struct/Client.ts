import anchorme from 'anchorme';
import { Client as DiscordClient, Message, Options } from 'discord.js';
import { createWriteStream } from 'fs-extra';
import { pipeline } from 'stream/promises';
import { Knex } from 'knex';
import fetch from 'node-fetch';
import * as Wiki from 'nodemw';
import { resolve } from 'path';
import { promisify } from 'util';
import { IClientAuth, IKamihime, IKamihimeWiki } from '../../typings';
import { Auth } from '../../typings/auth';
import Server from './server';
// tslint:disable-next-line: no-var-requires
const { discordClient: discordAuth } = require('../../auth') as Auth;

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
  }

  public server: Server;

  public wiki: Wiki;

  public discord: DiscordClient;

  public auth: IClientAuth = { discord: discordAuth };

  public fields = [ 'id', 'name', 'avatar', 'element', 'rarity', 'type', 'tier', 'atk', 'hp', 'main', 'preview' ];

  public init () {
    this.wiki = new Wiki({
      debug: false,
      path: '',
      protocol: 'https',
      server: 'kamihime-project.wikia.com',
      userAgent: 'kamihime-database/3.0.0 (https://github.com/gazmull/kamihime-database) nodemw/0.12.2'
    });

    getImageInfo = promisify(this.wiki.getImageInfo.bind(this.wiki));
    getArticle = promisify(this.wiki.getArticle.bind(this.wiki));

    this.server.util.logger.info('Client: Initialised');

    return this;
  }

  public startDiscordClient () {
    if (!(discordAuth.channel || discordAuth.token)) return;

    this.discord = new DiscordClient({
      intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_MESSAGES',
      ],
      makeCache: Options.cacheWithLimits({ MessageManager: 10 }),
      presence: {
        status: 'online'
      }
    });

    const handleMessage = async (message: Message) => {
      if (message.channel.id !== discordAuth.channel) return;
      if (!this.server.auth.exempt.includes(message.author.id)) return;

      const msg = anchorme({
        input: message.cleanContent,
        options: {
          truncate: 10,
          middleTruncation: false,
          attributes: { target: '_blank' }
        }
      });

      try {
        await this.server.util.db('status').del();
        await this.server.util.db('status').insert({
          id: message.id,
          message: msg
        });

        this.server.status = {
          content: msg,
          date: message.createdTimestamp
        };
      } catch (e) { this.server.util.logger.error(e); }

      this.server.util.logger.info('Discord Bot: New announcement has been saved.');
    };

    this.discord
      // Doesn't like Winston instance for some reason
      .on('ready', () => { this.server.util.logger.info(`Discord Bot: logged in as ${this.discord.user.tag}.`); })
      .on('error', err => { this.server.util.logger.error(err); })
      .on('message', handleMessage)
      .on('messageUpdate', (_, newMessage) => handleMessage(newMessage as Message))
      .login(discordAuth.token);

    return this;
  }

  /**
   * Calls add and update functions every time specified from COOLDOWN.
   * @param forced Whether the call is forced or not [can be forced thru server API (api/refresh)]
   */
  public startKamihimeDatabase (forced: boolean = false) {
    this.server.util.logger.info('Kamihime Database: [ADD] Start');
    this._each([ 'x', 'w' ], this._add.bind(this))
      .then(() => {
        this.server.util.logger.info('Kamihime Database: [ADD] End');
        this.server.util.logger.info('Kamihime Database: [UPDATE] Start');

        return this._each([ 's', 'e', 'k', 'w' ], this._update.bind(this));
      })
      .then(() => {
        this.server.util.logger.info('Kamihime Database: [UPDATE] End');

        return this.server.util.logger.info('Refreshed Kamihime Database.');
      })
      .catch(this.server.util.logger.error);

    if (forced) {
      clearTimeout(khTimeout);
      khTimeout = setTimeout(() => this.startKamihimeDatabase(), COOLDOWN);
    } else
      khTimeout = setTimeout(() => this.startKamihimeDatabase(), COOLDOWN);

    return this;
  }

  protected async _each<T> (arr: T[], fn: (arg: T) => PromiseLike<any>) {
    const resolvedArr: T[] = [];

    for (const v of arr) {
      const resolved = await fn(v);

      resolvedArr.push(resolved);
    }

    return resolvedArr;
  }

  /**
   * Adds items into the kamihime database.
   * @param idPrefix The prefix of item type to refresh.
   */
  protected async _add (idPrefix: string) {
    try {
      const whereState = idPrefix === 'x' ? 'id LIKE \'x%\' or id LIKE \'e%\'' : `id LIKE '${idPrefix}%'`;
      const rows: IKamihime[] = await this.server.util.db('kamihime').select(this.fields)
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

      this.server.util.logger.info(`Kamihime Database: [ADDING] ${id}...`);

      let result = await this._parseDatabase(id);
      result = result.filter(el => !existing.includes(el.name.toLowerCase()));

      if (!result.length) return this.server.util.logger.info(`Kamihime Database: [ADD SKIPPED] ${id}`);

      let fromIndex = rows.length ? parseInt(rows[0].id.slice(1)) + 1 : -1;
      const itemsAdded = [];
      let currentCalls = 0;

      for (const el of result) {
        const checkCall: () => boolean = () => {
          if (currentCalls === API_MAX_CALLS) {
            this.server.util.logger.warn(`Kamihime Database: [RATE LIMITED] ${id}`);

            return true;
          }

          return false;
        };

        const newId = `${idPrefix}${++fromIndex}`;

        // -- Portrait

        const portraitName = `File:${el.name} Portrait${fileNameSuffix}`;
        let avatar: string = null;
        const avatarInfo = await getImageInfo(portraitName);

        if (avatarInfo && avatarInfo.url) {
          const avatarFetch = await fetch(clean(avatarInfo.url));

          if (!avatarFetch.ok) throw new Error(`${portraitName} returns ${avatarFetch.status}`);

          const path = `portrait/${el.name} Portrait${fileNameSuffix}`;

          await pipeline(avatarFetch.body, createWriteStream(IMAGES_PATH + path, { encoding: 'binary' }));

          avatar = path;
        }

        // -- Close

        let preview: string = null;
        if (idPrefix !== 'w') {
          const previewName = `File:${el.name} Close.png`;
          const previewInfo = await getImageInfo(previewName);

          if (previewInfo && previewInfo.url) {
            const previewFetch = await fetch(clean(previewInfo.url));

            if (!previewFetch.ok) throw new Error(`${previewName} returns ${previewFetch.status}`);

            const path = `close/${el.name} Close.png`;

            await pipeline(previewFetch.body, createWriteStream(IMAGES_PATH + path, { encoding: 'binary' }));

            preview = path;
          }
        }

        // -- Main

        const mainName = `File:${el.name}.png`;
        let main: string = null;
        const mainInfo = await getImageInfo(mainName);

        if (mainInfo && mainInfo.url) {
          const mainFetch = await fetch(clean(mainInfo.url));

          if (!mainFetch.ok) throw new Error(`${mainName} returns ${mainFetch.status}`);

          const path = `main/${el.name}.png`;

          await pipeline(mainFetch.body, createWriteStream(IMAGES_PATH + path, { encoding: 'binary' }));

          main = path;
        }

        await this.server.util.db('kamihime')
          .insert({
            avatar,
            main,
            preview,
            element: el.element.includes(';') ? 'All' : el.element,
            id: newId,
            name: clean(el.name),
            peeks: 0,
            rarity: el.rarity,
            type: el.type,
            atk: el.atk_max,
            hp: el.hp_max
          });

        itemsAdded.push(el.name);
        currentCalls++;

        if (checkCall()) break;
      }

      const length = itemsAdded.length;

      await this.server.util.discordSend(this.auth.discord.wikiReportChannel, [
        `**${id}**: __Added ${length}__`,
        `\`\`\`diff`,
        itemsAdded.slice(0, 30).map(slicedEntries).join('\n'),
        length > 30 ? `- And ${length - 30} more... (See console logs)` : '',
        '```',
      ].join('\n'));

      return this.server.util.logger.info(`Kamihime Database: [ADDED] ${id} (${length}): ${itemsAdded.join(', ')}`);
    } catch (err) { return this.server.util.logger.error(err); }
  }

  /**
   * Updates items from the kamihime database.
   * @param idPrefix The prefix of item type to refresh.
   */
  protected async _update (idPrefix: string) {
    try {
      let query: Knex.QueryBuilder = this.server.util.db('kamihime').select(this.fields)
        .whereRaw(`id LIKE '${idPrefix}%'`);
      query = idPrefix === 'e' ? query.orWhereRaw('id LIKE \'x%\'') : query;

      const rows: IKamihime[] = await query;

      let id: string = null;
      let fileNameSuffix: string = null;

      switch (idPrefix) {
        case 'e':
        case 's':
        case 'k':
          id = {
            e: 'Eidolon',
            k: 'Kamihime',
            s: 'Soul'
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

      this.server.util.logger.info(`Kamihime Database: [UPDATING] ${id}...`);

      const result = await this._parseDatabase(id);
      const itemsUpdated = [];
      let currentCalls = 0;

      for (const el of result) {
        const info = rows.find(r => r.name === el.name);

        if (!info) continue;
        const checkCall: () => boolean = () => {
          if (currentCalls === API_MAX_CALLS) {
            this.server.util.logger.warn(`Kamihime Database: [RATE LIMITED] ${id}`);

            return true;
          }

          return false;
        };

        const updateFields: IKamihime = {};

        // -- Portrait

        if (!info.avatar) {
          const name = `File:${el.name} Portrait${fileNameSuffix}`;
          let avatar: string = null;
          const info = await getImageInfo(name);

          if (info && info.url) {
            const fetched = await fetch(clean(info.url));

            if (!fetched.ok) throw new Error(`${name} returns ${fetched.status}`);

            const path = `portrait/${el.name} Portrait${fileNameSuffix}`;

            await pipeline(fetched.body, createWriteStream(IMAGES_PATH + path, { encoding: 'binary' }));

            avatar = path;
            updateFields.avatar = avatar;
          }
        }

        // -- Close

        if (!info.preview && idPrefix !== 'w') {
          const name = `File:${el.name} Close.png`;
          let preview: string = null;
          const info = await getImageInfo(name);

          if (info && info.url) {
            const fetched = await fetch(clean(info.url));

            if (!fetched.ok) throw new Error(`${name} returns ${fetched.status}`);

            const path = `close/${el.name} Close.png`;

            await pipeline(fetched.body, createWriteStream(IMAGES_PATH + path, { encoding: 'binary' }));

            preview = path;
            updateFields.preview = preview;
          }
        }

        // -- Main

        if (!info.main) {
          const name = `File:${el.name}.png`;
          let main: string = null;
          const info = await getImageInfo(name);

          if (info && info.url) {
            const fetched = await fetch(clean(info.url));

            if (!fetched.ok) throw new Error(`${name} returns ${fetched.status}`);

            const path = `main/${el.name}.png`;

            await pipeline(fetched.body, createWriteStream(IMAGES_PATH + path, { encoding: 'binary' }));

            main = path;
            updateFields.main = main;
          }
        }

        if (el.rarity && info.rarity !== el.rarity)
          updateFields.rarity = el.rarity;

        if (el.tier && info.tier !== el.tier)
          updateFields.tier = el.tier;

        if (el.element && !el.tier && info.element !== 'All' && info.element !== el.element)
          updateFields.element = el.element.includes(';') ? 'All' : el.element;

        if (el.type && info.type !== el.type)
          updateFields.type = el.type;

        if (el.atk_max && info.atk !== el.atk_max)
          updateFields.atk = el.atk_max;

        if (el.hp_max && info.hp !== el.hp_max)
          updateFields.hp = el.hp_max;

        if (!Object.keys(updateFields).length) continue;

        const nRarityRegex = / \(N\)/;
        const testedRarity = nRarityRegex.test(el.name);
        const shouldIncludeLowerRarity = testedRarity
          ? `name = '${escape(el.name)}' OR name = '${escape(el.name).replace(nRarityRegex, '')}'`
          : `name = '${escape(el.name)}'`;

        await this.server.util.db('kamihime')
          .update(updateFields)
          .whereRaw(shouldIncludeLowerRarity);

        itemsUpdated.push(`${el.name}: ${Object.keys(updateFields).join(', ')}`);
        currentCalls++;

        if (checkCall()) break;
      }

      const length = itemsUpdated.length;

      if (!length) return this.server.util.logger.info(`Kamihime Database: [UPDATE SKIPPED] ${id}`);

      await this.server.util.discordSend(this.auth.discord.wikiReportChannel, [
        `**Kamihime Database**: **${id}**: __Updated ${length}__`,
        `\`\`\`diff`,
        itemsUpdated.slice(0, 30).map(slicedEntries).join('\n'),
        length > 30 ? `- And ${length - 30} more... (See console logs)` : '',
        '```',
      ].join('\n'));

      return this.server.util.logger.info(`Kamihime Database: [UPDATED] ${id} (${length}): ${itemsUpdated.join(', ')}`);
    } catch (err) { return this.server.util.logger.error(err); }
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
      .trim()
      .replace(/.+\s.+?= {/, '[')
      .replace(/,?\s+?}\s+?.+$/, ']')
      .replace(/({|,\s?)([\w]+?)(=["\d])/g, '$1"$2"$3')
      .replace(/=/g, ':')) as IKamihimeWiki[];
  }
}
