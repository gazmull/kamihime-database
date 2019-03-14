import * as Knex from 'knex';
import { resolve } from 'path';
import { IKamihime } from '../../../typings';
import { database } from '../../auth/auth';
import Winston from '../Logger';
import Extractor from './util/Extractor';

let code = 0;
const logger = new Winston().logger;

start();

export default async function start () {
  try {
    logger.warn('kh-snek started...');

    let query = Knex(database)('kamihime').select([
      'id',
      'harem1Resource1',
      'harem2Resource1', 'harem2Resource2',
      'harem3Resource1', 'harem3Resource2',
    ])
    .where('approved', 1);

    const latest = process.argv.find(el => [ '-l', '--latest=' ].some(f => new RegExp(`^${f}`, 'i').test(el)));
    const id = process.argv.find(el => [ '-i', '--id=' ].some(f => new RegExp(`^${f}`, 'i').test(el)));
    const type = process.argv.find(el =>
      [
        '--eidolon',
        '--soul',
        '--ssr+', '--ssr', '--sr', '--r',
      ].some(f => new RegExp(`^${f}`, 'i').test(el)),
    );

    if (latest && id) throw new Error('Latest and ID cannot be invoked at the same time.');
    if (id && type) throw new Error('ID and Type cannot be invoked at the same time.');

    if (latest) {
      const detectNum = /--latest=/.test(latest) ? latest.split('=').pop() : latest.slice(2);
      const num = parseInt(detectNum);

      if (isNaN(num) || num <= 0)
        throw new TypeError('Latest value should be a valid unsigned integer and more than 0.');

      query = query
        .orderBy('_rowId', 'DESC')
        .limit(num);
    } else if (id) {
      const val = /--id=/.test(id) ? id.split('=').pop() : id.slice(2);

      if (!val)
        throw new Error('ID value should be not empty.');

      query = query.andWhere('id', val);
    }

    if (type) {
      const _type = type.slice(2);

      switch (_type) {
        case 'eidolon': query = query.andWhereRaw('id LIKE \'e%\' AND approved=1'); break;
        case 'soul': query = query.andWhereRaw('id LIKE \'s%\' AND approved=1'); break;
        case 'ssr+':
        case 'ssr':
        case 'sr':
        case 'r':
          query = query.andWhereRaw(`id LIKE 'k%' AND rarity='${_type.toUpperCase()}' AND approved=1`);
          break;
      }
    }

    const CHARACTERS: IKamihime[] = await query;

    if (!CHARACTERS.length)
    logger.info('Nothing to be processed.');
    else
      await new Extractor({
        logger,
        base: {
          CHARACTERS,
          DESTINATION: resolve(__dirname, '../../../static/scenarios'),
          URL: { SCENARIOS: 'https://cf.static.r.kamihimeproject.dmmgames.com/scenarios/' },
        },
        codes: {
          e: { // -- Eidolon
            get: '9f/51/',
            intro: '9f/51/',
            scene: 'd7/ad/',
          },
          k: { // -- Kamihime
            get: '76/89/',
            intro: '94/76/',
            scene: 'de/59/',
          },
          s: { // -- Soul
            get: '3b/26/',
            intro: '67/01/',
            scene: 'ec/4d/',
          },
        },
      }).exec();
  } catch (err) {
    logger.error(err.stack);

    code = 1;
  } finally {
    logger.info('kh-snek finished.');

    process.exit(code);
  }
}
