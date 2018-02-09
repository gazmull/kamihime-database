const express           = require('express');
const bodyParser        = require('body-parser');
const pug               = require('pug');
const sql               = require('sqlite');
const server            = express();
const Collection        = require('./utils/Collection');

const { database, hostAddress } = require('./auth.json');
const methods = Object.keys(require('./auth.json').rateLimits);

server.set('view engine', 'pug');
server.set('views', './views');
server.set('json spaces', 2);
server.disable('x-powered-by');
server.use(express.static(__dirname + '/static'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
sql.open(database);

global.recentVisitors = new Collection();
global.rateLimits = new Collection();

for(const method of methods) {
  rateLimits.set(method, new Collection());
  console.log(`API: Ratelimiter: Method ${method.toLocaleUpperCase()}'s Collection is set!`);
}

server
  .get('/', (req, res) => require('./routes/browser').execute(req, res))

  .get(['/api/:method', '/api/:method/*?'], (req, res, next) => require('./routes/api/index').execute(req, res, next))
  .get('/api/get/:id', (req, res) => require('./routes/api/GET/get').execute(req, res))
  .get('/api/search', (req, res) => require('./routes/api/GET/search').execute(req, res))

  .get('/dashboard', (req, res) => require('./routes/dashboard').execute(req, res))
  .get('/latest', (req, res) => require('./routes/latest').execute(req, res))
  .get('/player/:id/:ep/:res', (req, res) => require('./routes/player').execute(req, res))

  .get('/justmonika', (req, res) => require('./routes/justmonika').execute(req, res))
  .get('/wae', (req, res) => require('./routes/wae').execute(req, res))

  .post('/redirect', (req, res) => require('./routes/redirect').execute(req, res))

  .all('*', (req, res) => res.send('|Eros|403: Access Denied.'))

  .listen(80);
console.log(`Listening to ${hostAddress}:80`);
setInterval(() => {
  const filterVisitors = recentVisitors.filter(v => Date.now() - v.expiration > 1000 * 60 * 30);
  if(!filterVisitors.size) return;
  for(const [v, prop] of filterVisitors) {
    recentVisitors.delete(v);
  }
  console.log(`${new Date(Date.now()).toLocaleString()}: Initiated visitors clean up. Cleaned: ${filterVisitors.size}`);
}, 1000 * 60 * 5);

process.on('unhandledRejection', err => console.error(`${new Date(Date.now()).toLocaleString()} | Uncaught Promise Error: \n${err.stack}`));