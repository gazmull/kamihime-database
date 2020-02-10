import * as cookieParser from 'cookie-parser';
import * as Express from 'express';
import * as helmet from 'helmet';
import { resolve } from 'path';
import { Auth } from '../typings/auth';
import Client from './struct/Client';
import Server from './struct/server';
// tslint:disable-next-line: no-var-requires
const { cookieSecret, proxy, urls } = require('../auth') as Auth;

const express = Express();
// tslint:disable-next-line: no-var-requires
const version = require('../package.json').version;

if (process.env.NODE_ENV === 'production')
  express
    .set('trust proxy', [ 'loopback', ...proxy ])
    .use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [
            '\'self\'',
            'www.w3.org',
            urls.g,
            urls.h,
          ],
          fontSrc: [ '\'self\'', 'fonts.gstatic.com', 'cdn.jsdelivr.net' ],
          imgSrc: [
            '\'self\'',
            'data:',
            urls.g,
            urls.h,
          ],
          scriptSrc: [ '\'self\'', '\'unsafe-inline\'', 'cdn.jsdelivr.net' ],
          styleSrc: [ '\'self\'', '\'unsafe-inline\'', 'fonts.googleapis.com', 'cdn.jsdelivr.net' ]
        }
      },
      hidePoweredBy: true,
      hsts: {
        includeSubDomains: true,
        maxAge: 31536000,
        preload: true
      }
    }));
else
  express
    .disable('x-powered-by')
    .enable('trust proxy')
    .use('/', Express.static(__dirname + '/static'))
    .use('/', Express.static(__dirname + '/../static'));

express
  .use(Express.urlencoded({ extended: true }))
  .use(Express.json({ limit: '1mb' }))
  .use(cookieParser(cookieSecret))
  .set('view engine', 'pug')
  .set('views', resolve(__dirname, './views'))
  .use((_, res, next) => {
    res.locals.app = {
      version,
      urls
    };

    next();
  });

const server: Server = new Server();
const client: Client = new Client(server);

server
  .init(express, client)
  .then(() =>
    server
      .startCleaners()
      .startKamihimeCache()
  );

client
  .init()
  .startDiscordClient()
  .startKamihimeDatabase();

process.on(
  'unhandledRejection',
  (err: Error) => server.util.logger.error(`Uncaught Promise Error: \n${err.stack || err}`)
);
