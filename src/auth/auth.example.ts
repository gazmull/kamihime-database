// @ts-ignore
import { Api, WebHook } from './auth.d.ts';
import { Config as Database } from 'knex';
import { resolve } from 'path';

export const database: Database = {
  client: 'sqlite3',
  connection: { filename: resolve(__dirname, '../../provider/Eros.db') },
  acquireConnectionTimeout: 10000,
  useNullAsDefault: true
};

export const hostAddress: string = '127.0.0.1';

export const rootURL: string = 'http://localhost/';

export const api: Api = {
  url: 'http://localhost/api/',
  token: 'null'
};

export const hook: WebHook = {
  id: '319102712383799296',
  token: 'FfxhTJH6jt1Neve4LoR_8nXKqqjFQQ1ahShlzfszmuXhunK7AT6xsV3ZRzs6vdAts4YD'
};
