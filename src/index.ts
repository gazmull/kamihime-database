import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as helmet from 'helmet';
import { resolve } from 'path';
import * as favicon from 'serve-favicon';
// @ts-ignore
import { cookieSecret } from './auth/auth';
import Client from './struct/Client';
import Server from './struct/Server';
import { error } from './util/console';

const server = express();

server
  .use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [
          '\'self\'',
          'www.w3.org',
          'cf.static.r.kamihimeproject.dmmgames.com',
        ],
        fontSrc: [ '\'self\'', 'fonts.gstatic.com', 'maxcdn.bootstrapcdn.com' ],
        scriptSrc: [ '\'self\'', '\'unsafe-inline\'' ],
        styleSrc: [ '\'self\'', '\'unsafe-inline\'', 'fonts.googleapis.com', 'maxcdn.bootstrapcdn.com' ],
      },
    },
    hidePoweredBy: { setTo: 'cream3.14' },
  }))
  .use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.headers.host)
      res
        .json({ error: { code: 403, message: 'Send a host header!' } })
        .status(403);
    if (!req.secure && process.env.NODE_ENV === 'production')
      res.redirect(301, 'https://' + req.headers.hostname + req.originalUrl);

    next();
  })
  .set('trust proxy', [ '213.32.4.0/24', '144.217.9.0/24' ])
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(compression({ filter: req => !req.headers['x-no-compression'] }))
  .use(cookieParser(cookieSecret))
  .use(favicon(resolve(__dirname, '../static/favicon.ico')))
  .use(express.static(resolve(__dirname, '../static')))
  .set('view engine', 'pug')
  .set('views', resolve(__dirname, './views'));

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
