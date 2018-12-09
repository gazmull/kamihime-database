const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const pug = require('pug'); // eslint-disable-line no-unused-vars
const sql = require('sqlite');
const server = express();
const Collection = require('./utils/Collection');
const fs = require('fs');

const { database, hostAddress } = require('./auth');
const methods = require('./auth').rateLimits;

server.set('view engine', 'pug');
server.set('views', './views');
server.set('json spaces', 2);
server.disable('x-powered-by');
server.use(compression({ filter: req => !req.headers['x-no-compression'] }));
server.use(express.static(`${__dirname}/static`));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
sql.open(database);

global.errorHandler = require('./utils/errorHandler');
global.recentVisitors = new Collection();
global.rateLimits = new Collection();

/* eslint-disable no-undef, no-use-before-define */
for (const method of Object.keys(methods)) {
  rateLimits.set(method, new Collection());
  console.log(`API: Ratelimiter: Method ${method.toUpperCase()}`);
  for (const request of Object.keys(methods[method])) {
    rateLimits.get(method).set(request, new Collection());
    console.log(`-- ${request} Collection is set.`);
  }
}

const routeDir = fs.readdirSync('./routes/');

for (const route of routeDir)
  try {
    const file = new (require(`./routes/${route}`))(); // eslint-disable-line global-require
    if (!file.method) {
      console.log('Missing Method: Route %s was not included.', route);
      continue;
    }

    server[file.method](file.route, (req, res, next) => file.execute(req, res, next));
  } catch (err) {
    console.log(err);
  }

server
  .all('*', (req, res) => errorHandler(res, { code: 403, message: 'Forbidden.' })) // eslint-disable-line no-unused-vars
  .listen(80);
console.log(`Listening to ${hostAddress}:80`);

setInterval(() => {
  cleanVisitors();
  cleanRateLimits();
  cleanSessions();
}, 1000 * 60 * 3);

process.on('unhandledRejection', err => console.error(`${new Date(Date.now()).toLocaleString()} | Uncaught Promise Error: \n${err.stack}`));

function cleanVisitors() {
  const filterVisitors = recentVisitors.filter(v => Date.now() - v.expiration > 1000 * 60 * 30);
  if (!filterVisitors.size) return;
  for (const k of filterVisitors.keys())
    recentVisitors.delete(k);

  console.log(`${new Date(Date.now()).toLocaleString()}: Initiated visitors clean up. Cleaned: ${filterVisitors.size}`);
}

function cleanRateLimits() {
  for (const method of Object.keys(methods))
    for (const request of Object.keys(methods[method])) {
      const filterUsers = rateLimits.get(method).get(request).filter(u => Date.now() - u.timestamp >= methods[method][request].cooldown * 1000);
      if (!filterUsers.size) continue;
      for (const k of filterUsers.keys())
        rateLimits.get(method).get(request).delete(k);

      console.log(
        `${new Date(Date.now()).toLocaleString()}: Initiated API users clean up (Request: ${method}/${request}). Cleaned: ${filterUsers.size}`
      );
    }
}

async function cleanSessions() {
  const sessions = await sql.all('SELECT sID FROM sessions WHERE sAge <= datetime(\'now\', \'-30 minutes\')');
  if (sessions.length) {
    await sql.run('DELETE FROM sessions WHERE sAge <= datetime(\'now\', \'-30 minutes\')');
    console.log(`${new Date(Date.now()).toLocaleString()}: Initiated DELETE sessions.`);
  }
}
