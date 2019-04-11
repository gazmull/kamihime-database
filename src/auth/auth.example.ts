import { Api, DiscordClient, Github, GrantProvider, Host } from 'auth';
import { Config as Database } from 'knex';

/**
 * The database configuration to use for the server
 */
export const database: Database = {
  acquireConnectionTimeout: 10000,
  client: 'mysql2',
  connection: {
    database: 'kamihimedb',
    host: '127.0.0.1',
    password: 'uvweve',
    user: 'root'
  },
  pool: {
    max: 30,
    min: 0
  }
};

/**
 * List of IP Addresses from trusted proxy (Production ENV only)
 */
export const proxy: string[] = [ 'i.love.turtles' ];

/**
 * The host configuration to use for the server
 */
export const host: Host = {
  address: '127.0.0.1',
  port: 80
};

/**
 * Users to exclude from being throttled while browsing characters.
 *
 * Recommended for lead testers.
 *
 * WATCH OUT:
 * This is also used for authorized user messages (announcements for the site status) to be read by the Discord Bot.
 */
export const exempt: string[] = [
  '319102712383799296',
];

/**
 * The server's root URL
 */
export const rootURL = 'http://localhost/';

/**
 * Configuration for this server's API
 */
export const api: Api = {
  token: 'null',
  url: 'http://localhost/api/'
};

/**
 * Secret to use for express-cookieParser
 */
export const cookieSecret = 'your cookie secret';

/**
 * Discord provider OAuth2 Grant configuration
 */
export const discord: GrantProvider = {
  callback: 'connect',
  key: 'blah',
  scope: [ 'identify' ],
  secret: 'buh'
};

/**
 * Configuration for Discord Bot.
 *
 * This only serves as a website status message scraper and reports (KamihimeDB/Wikia) sender
 */
export const discordClient: DiscordClient = {
  channel: '319102712383799296',
  dbReportChannel: '319102712383799296',
  token: 'FfxhTJH6jt1Neve4LoR_8nXKqqjFQQ1ahShlzfszmuXhunK7AT6xsV3ZRzs6vdAts4YD',
  wikiReportChannel: '319102712383799296'
};

/**
 * Configuration for Github.
 *
 * This serves as your auth to access the blacklist for Scenarios Util.
 *
 * Warning: Only change the gist if you have your own blacklist, and the blacklist's filename must be `.blacklist`.
 *
 * -
 *
 * Get your personal access token at https://github.com/settings/tokens
 *
 * Create a token with no scope, since the util will only need to read the gist.
 */
export const github: Github = {
  gist: '45cd187e4a476795bcef630a8018e1a6',
  token: 'ieatalotofass'
};
