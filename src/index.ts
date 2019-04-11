import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as helmet from 'helmet';
import { resolve } from 'path';
import { cookieSecret, proxy } from './auth/auth';
import Client from './struct/Client';
import Server from './struct/Server';

const server = express();

if (process.env.NODE_ENV === 'production')
  server
    .set('trust proxy', proxy)
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
          styleSrc: [ '\'self\'', '\'unsafe-inline\'', 'fonts.googleapis.com', 'cdn.jsdelivr.net' ]
        }
      },
      hidePoweredBy: { setTo: 'cream3.14' },
      hsts: {
        includeSubDomains: true,
        maxAge: 31536000,
        preload: true
      }
    }));
else
  server
    .disable('x-powered-by')
    .enable('trust proxy')
    .use(express.static(__dirname + '/static'))
    .use(express.static(__dirname + '/../static'));

server
  .use(express.urlencoded({ extended: true }))
  .use(express.json({ limit: '1mb' }))
  .use(cookieParser(cookieSecret))
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
  .then(() =>
    serverStruct
      .startCleaners()
      .startKamihimeCache()
  );

client
  .init()
  .startDiscordClient()
  .startKamihimeDatabase();

process.on(
  'unhandledRejection',
  (err: Error) => serverStruct.util.logger.error(`Uncaught Promise Error: \n${err.stack || err}`)
);
