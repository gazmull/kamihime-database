const express           = require('express');
const bodyParser        = require('body-parser');
const pug               = require('pug');
const sql               = require('sqlite');
const server            = express();
const Collection        = require('./utils/Collection');

server.set('view engine', 'pug');
server.set('views', './views');
server.set('json spaces', 2);
server.disable('x-powered-by');
server.use(express.static(__dirname + '/static'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
sql.open('../eros/db/Eros.db'); //Comment this
//sql.open('./db/Resources.db'); //Uncomment if snek's files are in the same directory
//sql.open('../snek/db/Resources.db'); //Uncomment if snek's files are in its own directory

const recentVisitors = new Collection();

server
  .get('/', (req, res) => require('./routes/browser').execute(req, res))

  .get('/api/search', (req, res) => require('./routes/api/search').execute(req, res))
  .get('/api/get/:id', (req, res) => require('./routes/api/get').execute(req, res))

  .get('/dashboard', (req, res) => require('./routes/dashboard').execute(req, res))
  .get('/latest', (req, res) => require('./routes/latest').execute(req, res))
  .get('/player/:id/:ep/:res', (req, res) => require('./routes/player').execute(req, res, recentVisitors))

  .get('/justmonika', (req, res) => require('./routes/justmonika').execute(req, res))
  .get('/wae', (req, res) => require('./routes/wae').execute(req, res))

  .post('/redirect', (req, res) => require('./routes/redirect').execute(req, res))

  .all('*', (req, res) => res.send('|Eros|403: Access Denied.'))

  .listen(80);
console.log('Listening to http://localhost:80');
setInterval(() => {
  const filterVisitors = recentVisitors.filter(v => Date.now() - v.expiration > 1000 * 60 * 30);
  if(!filterVisitors.size) return;
  for(const [v, prop] of filterVisitors) {
    recentVisitors.delete(v);
  }
  console.log(`${new Date(Date.now()).toLocaleString()}: Initiated visitors clean up. Cleaned: ${filterVisitors.size}`);
}, 1000 * 60 * 5);

process.on('unhandledRejection', err => console.error(`${new Date(Date.now()).toLocaleString()} | Uncaught Promise Error: \n${err.stack}`));