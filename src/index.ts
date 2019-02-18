import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as helmet from 'helmet';
import { resolve } from 'path';
import * as favicon from 'serve-favicon';
// @ts-ignore
import { cookieSecret } from './auth/auth';
import enforceSecured from './middleware/enforce-secured';
import Client from './struct/Client';
import Server from './struct/Server';
import { error } from './util/console';

const server = express();

if (process.env.NODE_ENV === 'production')
  server
    .enable('trust proxy')
    .use(enforceSecured())
    .use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [
            '\'self\'',
            'www.w3.org',
            'cf.static.r.kamihimeproject.dmmgames.com',
          ],
          fontSrc: [ '\'self\'', 'fonts.gstatic.com', 'cdn.jsdelivr.net' ],
          imgSrc: [
            '\'self\'',
            'data:',
            'cf.static.r.kamihimeproject.dmmgames.com',
          ],
          scriptSrc: [ '\'self\'', '\'unsafe-inline\'', 'cdn.jsdelivr.net' ],
          styleSrc: [ '\'self\'', '\'unsafe-inline\'', 'fonts.googleapis.com', 'cdn.jsdelivr.net' ],
        },
      },
      hidePoweredBy: { setTo: 'cream3.14' },
      hsts: {
        includeSubdomains: true,
        maxAge: 31536000,
        preload: true,
      },
    }));
else server.disable('x-powered-by');

server
  .use(express.urlencoded({ extended: true }))
  .use(express.json({ limit: '1mb' }))
  .use(compression({ filter: req => !req.headers['x-no-compression'], threshold: 0 }))
  .use(cookieParser(cookieSecret))
  .use(favicon(resolve(__dirname, '../static/favicon.ico')))
  .use(express.static(resolve(__dirname, '../static')))
  .set('view engine', 'pug')
  .set('views', resolve(__dirname, './views'))
  .use((_, res, next) => {
    res.locals.app = { version: require('../package.json').version };

    next();
  });

const serverStruct: Server = new Server();
const client: Client = new Client(serverStruct);

serverStruct
  .init(server, client)
  .startCleaners()
  .startKamihimeCache();

client
  .init()
  .startDiscordClient()
  .startKamihimeDatabase();

process.on('unhandledRejection', err => error(`Uncaught Promise Error: \n${err.stack || err}`));
