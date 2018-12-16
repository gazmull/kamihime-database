import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { resolve } from 'path';
import * as favicon from 'serve-favicon';
import { session as secret } from './auth/auth';
import Client from './struct/Client';
import Server from './struct/Server';
import { error } from './util/console';

const server = express();

server
  .disable('x-powered-by')
  .set('view engine', 'pug')
  .set('views', resolve(__dirname, './views'))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(compression({ filter: req => !req.headers['x-no-compression'] }))
  .use(cookieParser(secret))
  .use(favicon(resolve(__dirname, '../static/favicon.ico')))
  .use(express.static(resolve(__dirname, '../static')));

const serverStruct: Server = new Server();
const client: Client = new Client(serverStruct);

serverStruct
  .init(server, client)
  .startCleaners()
  .startKamihimeCache();

client
  .init()
  .startKamihimeDatabase();

process.on('unhandledRejection', err => error(`Uncaught Promise Error: \n${err.stack || err}`));
