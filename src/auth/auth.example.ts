import { Api, GrantProvider, Host, WebHook } from 'auth';
import { Config as Database } from 'knex';

/**
 * The database configuration to use for the server (Sessions and Kamihime)
 */
export const database: Database = {
  acquireConnectionTimeout: 10000,
  client: 'mysql2',
  connection: {
    database: 'kamihimedb',
    host: '127.0.0.1',
    password: 'uvweve',
    user: 'root',
  },
  pool: {
    max: 30,
    min: 0,
  },
};

/**
 * The host configuration to use for the server
 */
export const host: Host = {
  address: '127.0.0.1',
  port: 80,
};

/**
 * Users to exclude from being throttled while browsing characters.
 * Recommended for lead testers.
 */
export const exempt: string[] = [
  '319102712383799296',
];

/**
 * The server's root URL
 */
export const rootURL: string = 'http://localhost/';

/**
 * Configuration for this server's API
 */
export const api: Api = {
  token: 'null',
  url: 'http://localhost/api/',
};

/**
 * Configuration for the Discord channel's webhook.
 */
export const hook: WebHook = {
  id: '319102712383799296',
  token: 'FfxhTJH6jt1Neve4LoR_8nXKqqjFQQ1ahShlzfszmuXhunK7AT6xsV3ZRzs6vdAts4YD',
};

/**
 * Secret to use for express-cookieParser
 */
export const cookieSecret: string = 'your cookie secret';

/**
 * Discord provider OAuth2 Grant configuration
 */
export const discord: GrantProvider = {
  callback: 'connect',
  key: 'blah',
  scope: [ 'identify' ],
  secret: 'buh',
};
