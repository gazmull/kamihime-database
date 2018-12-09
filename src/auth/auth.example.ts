import { Api, WebHook } from 'auth';
import { Config as Database } from 'knex';
import { resolve } from 'path';

/**
 * The database configuration to use for the server. (Sessions and Kamihime)
 */
export const database: Database = {
  client: 'sqlite3',
  connection: { filename: resolve(__dirname, '../../provider/Eros.db') },
  acquireConnectionTimeout: 10000,
  useNullAsDefault: true
};

/**
 * The machine's external IP Address.
 */
export const hostAddress: string = '127.0.0.1';

/**
 * The server's root URL
 */
export const rootURL: string = 'http://localhost/';

/**
 * Configuration for this server's API
 */
export const api: Api = {
  url: 'http://localhost/api/',
  token: 'null'
};

/**
 * Configuration for the Discord channel's webhook.
 */
export const hook: WebHook = {
  id: '319102712383799296',
  token: 'FfxhTJH6jt1Neve4LoR_8nXKqqjFQQ1ahShlzfszmuXhunK7AT6xsV3ZRzs6vdAts4YD'
};
