/* tslint:disable:max-line-length */

/**
 * The database configuration to use for the server
 */
exports.database = {
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
exports.proxy = [ 'i.love.turtles' ];

/**
 * The host configuration to use for the server
 */
exports.host = {
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
exports.exempt = [
  '319102712383799296',
];

/**
 * The server(s) URLs
 */
exports.urls = {
  root: 'http://localhost/', // Site
  g: 'http://localhost/g/', // CG server
  h: 'http://localhost/h/' // HCG server
};

/**
 * The local directories
 */
exports.dirs = {
  h: {
    scenarios: '/dh/scenarios/',
    zips: '/dh/tgz/'
  }
};

/**
 * Configuration for this server's API
 */
exports.api = {
  token: 'null',
  url: 'http://localhost/api/'
};

/**
 * Secret to use for express-cookieParser
 */
exports.cookieSecret = 'your cookie secret';

/**
 * Discord provider OAuth2 Grant configuration
 */
exports.discord = {
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
exports.discordClient = {
  channel: '319102712383799296',
  dbReportChannel: '319102712383799296',
  token: 'FfxhTJH6jt1Neve4LoR_8nXKqqjFQQ1ahShlzfszmuXhunK7AT6xsV3ZRzs6vdAts4YD',
  wikiReportChannel: '319102712383799296',
  donorID: '589516127491719169'
};
