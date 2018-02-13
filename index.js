const express           = require('express');
const compression       = require('compression');
const bodyParser        = require('body-parser');
const pug               = require('pug');
const sql               = require('sqlite');
const server            = express();
const Collection        = require('./utils/Collection');
const fs                = require('fs');

const { database, hostAddress } = require('./auth.json');
const methods = require('./auth.json').rateLimits;

server.set('view engine', 'pug');
server.set('views', './views');
server.set('json spaces', 2);
server.disable('x-powered-by');
server.use(compression({
  filter: req => {
    return req.headers['x-no-compression'] ? false : true;
  }
}));
server.use(express.static(__dirname + '/static'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
sql.open(database);

global.errorHandler = require('./utils/errorHandler');
global.recentVisitors = new Collection();
global.rateLimits = new Collection();

for(const method of Object.keys(methods)) {
  rateLimits.set(method, new Collection());
  console.log(`API: Ratelimiter: Method ${method.toUpperCase()}`);
  for(const request of Object.keys(methods[method])) {
    rateLimits.get(method).set(request, new Collection());
    console.log(`-- ${request} Collection is set.`);
  }
}

const routeDir = fs.readdirSync('./routes/');

for(const route of routeDir) {
  try {
    const file = new (require(`./routes/${route}`))();
    switch(file.method) {
      case 'get':
        server.get(file.route, (req, res, next) => file.execute(req, res, next));
        break;
      case 'post':
        server.post(file.route, (req, res, next) => file.execute(req, res, next));
      default:
        console.log('Cannot include this method.');
    }
  }
  catch (err) { console.log(err); }
}

server.all('*', (req, res) => res.send('403: Access Denied.'))

  .listen(80);
console.log(`Listening to ${hostAddress}:80`);
setInterval(() => {
  cleanVisitors();
  cleanRateLimits();
}, 1000 * 60 * 3);

process.on('unhandledRejection', err => console.error(`${new Date(Date.now()).toLocaleString()} | Uncaught Promise Error: \n${err.stack}`));

function cleanVisitors() {
  const filterVisitors = recentVisitors.filter(v => Date.now() - v.expiration > 1000 * 60 * 30);
  if(!filterVisitors.size) return;
  for(const k of filterVisitors.keys()) {
    recentVisitors.delete(k);
  }
  console.log(`${new Date(Date.now()).toLocaleString()}: Initiated visitors clean up. Cleaned: ${filterVisitors.size}`);
}

function cleanRateLimits() {
  for(const method of Object.keys(methods)) {
    for(const request of Object.keys(methods[method])) {
      const filterUsers = rateLimits.get(method).get(request).filter(u => Date.now() - u.timestamp >= methods[method][request].cooldown * 1000);
      if(!filterUsers.size) continue;
      for(const k of filterUsers.keys()) {
        rateLimits.get(method).get(request).delete(k);
      }
      console.log(
        `${new Date(Date.now()).toLocaleString()}: Initiated API users clean up (Request: ${method}/${request}). Cleaned: ${filterUsers.size}`
      );
    }
  }
}