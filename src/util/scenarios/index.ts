import * as Knex from 'knex';
import { resolve } from 'path';
// @ts-ignore
import { database } from '../../auth/auth';
import { error, status, warn } from '../console';
import Extractor from './util/Extractor';

let code = 0;

start();

export default async function start () {
  try {
    warn('kh-snek started...');

    let query = Knex(database)('kamihime').select([
      'id',
      'harem1Resource1',
      'harem2Resource1', 'harem2Resource2',
      'harem3Resource1', 'harem3Resource2',
    ])
    .where('approved', 1);

    const latest = process.argv.find(el => el.includes('-l') || el.includes('--latest='));
    const id = process.argv.find(el => el.includes('-i') || el.includes('--id='));

    if (latest && id)
      throw new Error('Latest and ID cannot be invoked at the same time.');

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

    const CHARACTERS: IKamihime[] = await query;

    if (!CHARACTERS.length)
      status('Nothing to be processed.');
    else
      await new Extractor({
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
    error(err.stack);

    code = 1;
  } finally {
    status('kh-snek finished.');

    process.exit(code);
  }
}
