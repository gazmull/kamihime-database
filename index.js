const express           = require('express');
const bodyParser        = require('body-parser');
const pug               = require('pug');
const sql               = require('sqlite');
const server            = express();

server.set('view engine', 'pug');
server.set('views', ['./views', './player/views']);
server.disable('x-powered-by');
server.use(express.static(__dirname + '/static'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
sql.open('../eros/db/Eros.db');

server.get('/', (req, res) => res.send('|Eros|403: Access Denied.'));
server.get('/dashboard', async (req, res) => require('./routes/dashboard').execute(req, res));
server.get('/latest', async (req, res) => require('./routes/latest').execute(req, res));
server.get('/player/:id/:ep/:res', async (req, res) => require('./routes/player').execute(req, res));

server.post('/redirect', async (req, res) => require('./routes/redirect').execute(req, res));

server.all('*', (req, res) => res.send('|Eros|403: Access Denied.'));

server.listen(80);
console.log('Listening to http://localhost:80');

process.on('unhandledRejection', err => console.error(`${new Date().toLocaleString()} | Uncaught Promise Error: \n${err.stack}`));