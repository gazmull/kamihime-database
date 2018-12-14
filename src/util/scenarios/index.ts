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

    const CHARACTERS: any[] = await Knex(database)('kamihime').select([
      'id',
      'harem1Resource1',
      'harem2Resource1', 'harem2Resource2',
      'harem3Resource1', 'harem3Resource2'
    ])
    .where('approved', 1);

    await new Extractor({
      base: {
        CHARACTERS,
        DESTINATION: resolve(__dirname, '../../../static/scenarios'),
        URL: {
          BG_IMAGE: 'https://cf.static.r.kamihimeproject.dmmgames.com/scenarios/bgimage/',
          BGM: 'https://cf.static.r.kamihimeproject.dmmgames.com/scenarios/bgm/',
          FG_IMAGE: 'https://cf.static.r.kamihimeproject.dmmgames.com/scenarios/fgimage/',
          SCENARIOS: 'https://cf.static.r.kamihimeproject.dmmgames.com/scenarios/'
        }
      },
      codes: {
        e: { // -- Eidolon
          get: '9f/51/',
          intro: '9f/51/',
          scene: 'd7/ad/'
        },
        k: { // -- Kamihime
          get: '76/89/',
          intro: '94/76/',
          scene: 'de/59/'
        },
        s: { // -- Soul
          get: '3b/26/',
          intro: '67/01/',
          scene: 'ec/4d/'
        }
      }
    }).exec();
  } catch (err) {
    error(err.stack);

    code = 1;
  } finally {
    status('kh-snek finished.');

    process.exit(code);
  }
}
