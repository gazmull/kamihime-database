const express           = require('express');
const bodyParser        = require('body-parser');
const pug               = require('pug');
const sql               = require('sqlite');
const Discord           = require('discord.js');
const server            = express();

const { hookID, hookToken } = require('./auth.json');
const jsonExtract           = require('./utils/jsonExtract');

server.set('view engine', 'pug');
server.set('views', ['./views', './player/views']);
server.disable('x-powered-by');
server.use(express.static(__dirname + '/static'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
sql.open('../eros/db/Eros.db');
const dbHook = new Discord.WebhookClient(hookID, hookToken);

server.get('/', (req, res) => {
        res.send('|Eros|403.14: Access Denied.');
});

server.get('/dashboard', async (req, res) => {
        let backEnd_err;
        try {
                if(Object.keys(req.query).length === 0)
                        return res.send('|Eros|Invalid API request: empty query.');
                // localhost/dashboard?id={khID}&ses={sID}&k={sPW}
                const row  =  await sql.get(`SELECT * FROM kamihime WHERE khID='${req.query.id}'`);
                const session = await sql.get(`SELECT * FROM sessions WHERE sID='${req.query.ses}'`);

                if(!row)
                        throw backEnd_err = '|Eros|Character ID is invalid. Are trying to guess?';
                if(!session)
                        throw backEnd_err = '|Eros|Your session is invalid. Please ask for one in my Discord department.';
                if(req.query.k !== session.sPW)
                        throw backEnd_err = '|Eros|Your session is invalid. Please ask for one in my Discord department.';
                if(row.khApproved)
                        throw backEnd_err = '|Eros|This character is approved. Contact the administrator if there is something wrong.';
                res.render(`dashboard`, { json: row, user: session });
        }
        catch (err) {
                if(backEnd_err)
                        res.send(err.toString().replace(/'/g, ''));
        }
});

const t1Souls = [
            'Lancelot', 'Olivier', 'Vivian', 'Merlin', 'Beowulf', 'Van Helsing', 'Billy the Kid', 'Spartacus', 'Crowley', 'Yukimura'
];
        
const t2Souls = [
        'Gawain', 'Roland', 'Cassiopeia', 'Rosenkreuz', 'Gilgamesh', 'Asmund', 'Granuaile', 'Achilles', 'Cagliostro', 'Masamune'
];

server.post('/redirect', async (req, res) => {
        let input = req.body, reqArray = [], empty_Query;

        if(input.jsonCode) {
                try {
                        const info = JSON.parse(input.jsonCode);

                        const constructor = {
                                'khInfo_text':   info.description.replace(/'/g, '\'\''),
                                'khElement':     typeof info.job_id !== 'undefined'    ? null : jsonExtract.element(info.element_type),
                                'khType':        typeof info.summon_id !== 'undefined' ? null : typeof info.job_id !== 'undefined' ? jsonExtract.character(info.type) : jsonExtract.character(info.character_type),
                                'kh_HP':         typeof info.job_id !== 'undefined'    ? null : info.max_hp,
                                'kh_ATK':        typeof info.job_id !== 'undefined'    ? null : info.max_attack,
                                'khBurst':       typeof info.summon_id !== 'undefined' ? null : info.burst.name.replace(/'/g, '\'\''),
                                'khSkill1':      typeof info.summon_id !== 'undefined' ? jsonExtract.eidoPassive(info.effect)     : jsonExtract.ability(info.abilities[0]),
                                'khSkill1_text': typeof info.summon_id !== 'undefined' ? jsonExtract.eidoPassiveText(info.effect) : jsonExtract.abilityText(info.abilities[0]),
                                'khSkill2':      typeof info.summon_id !== 'undefined' ? jsonExtract.eidoAttack(info.attack)      : jsonExtract.ability(info.abilities[1]),
                                'khSkill2_text': typeof info.summon_id !== 'undefined' ? jsonExtract.eidoAttackText(info.attack)  : jsonExtract.abilityText(info.abilities[1]),
                                'khSkill3':      (typeof info.rare !== 'undefined' && info.rare === 'R') || typeof info.summon_id !== 'undefined' || (t1Souls.indexOf(input.khName) != -1 || t2Souls.indexOf(input.khName) != -1) ? null : jsonExtract.ability(info.abilities[2]),
                                'khSkill3_text': (typeof info.rare !== 'undefined' && info.rare === 'R') || typeof info.summon_id !== 'undefined' || (t1Souls.indexOf(input.khName) != -1 || t2Souls.indexOf(input.khName) != -1) ? null : jsonExtract.abilityText(info.abilities[2]),
                                'khSkill_ex1':   (typeof info.rare !== 'undefined' && info.rare === 'R') || typeof info.summon_id !== 'undefined' ? null : jsonExtract.assistAbility(info.assists[0]),
                                'khSkill_ex2':   (typeof info.rare !== 'undefined' && (info.rare === 'R' || info.rare === 'SR' || info.rare === 'SSR')) || typeof info.summon_id !== 'undefined' || typeof info.job_id !== 'undefined' && (t1Souls.indexOf(input.khName) != -1 || t2Souls.indexOf(input.khName) != -1) ? null : jsonExtract.assistAbility(info.assists[1]),
                        }

                        for(let key in constructor) {
                                if(constructor[key] !== null)
                                        reqArray.push(` ${key}='${constructor[key]}'`);
                        }

                        if(reqArray.length < 1) throw empty_Query = '|Eros|I will not accept completely NULL request.';  
                        await sql.run(`UPDATE kamihime SET ${reqArray.toString()} WHERE khID='${input.khID}'`);
                        await sql.run(`DELETE FROM sessions WHERE request_tagname='${input.request_tagname}' AND cID='${input.khID}'`);
                        await dbHook.send(`${input.request_tagname} Submitted Data for ${input.khName} (${input.khID}): \`\`\`py\n${reqArray.join('\n')}\n\`\`\``);
                        const ava = await sql.get(`SELECT khInfo_avatar FROM kamihime WHERE khID='${input.khID}'`);
                        res.render(`redirect`, { json: input, ava: ava }); 
                }
                catch (err) {
                        res.send(err.toString().replace(/'/g, ''));
                        if(!empty_Query)
                                console.log(err.stack);
                }
                return;
        }

        for(let key in input) {
                if(input[key] !== null) {
                        if(key.toString() === 'khID' || key.toString() === 'khName' || key.toString() === 'request_tagname' || input[key] === '') { continue; }
                        reqArray.push(` ${key}='${input[key]}'`);
                }
        }

        try {
                if(reqArray.length < 1) throw empty_Query = '|Eros|I will not accept completely NULL request.';
                await sql.run(`UPDATE kamihime SET ${reqArray.toString()} WHERE khID='${input.khID}'`);
                await sql.run(`DELETE FROM sessions WHERE request_tagname='${input.request_tagname}' AND cID='${input.khID}'`);
                await dbHook.send(`${input.request_tagname} Submitted Data for ${input.khName} (${input.khID}): \`\`\`py\n${reqArray.join('\n')}\n\`\`\``);
                const ava = await sql.get(`SELECT khInfo_avatar FROM kamihime WHERE khID='${input.khID}'`);
                res.render(`redirect`, { json: input, ava: ava });
        }
        catch (err) {
                res.send(err.toString().replace(/'/g, ''));
                if(!empty_Query)
                        console.log(err.stack);
        }
});

server.get('/player/:id/:ep/:res', async (req, res) => {
        let backEnd_err;
        try {

                if(Object.keys(req.params).length === 0)
                        return res.send('|Eros|Invalid API request: empty query.');
                // localhost/player/{khID}/{ep}/{resource2}
                const row  =  await sql.get(`SELECT * FROM kamihime WHERE khID='${req.params.id}'`);
                let episode = req.params.ep;

                if(!row)
                        throw backEnd_err = '|Eros|Invalid API Request: character does not exist.';
                else if( !(episode > 1 && episode < 4) )
                        throw backEnd_err = '|Eros|Invalid API Request: selected episode is beyond valid episodes.';
                else if( (row.khEidolon && episode == 3) || (row.khRare && episode == 3) || (row.khSoul && episode == 3))
                        throw backEnd_err = '|Eros|Invalid API Request: Eidolon/Rare/SSRA cannot contain third harem episode.';
                else if( (!row.khHarem_hentai1Resource2 && episode == 2) ||
                        (!row.khHarem_hentai2Resource2 && episode == 3) )
                        throw backEnd_err = '|Eros|Invalid API Request: no such episode found.';
                else if( !((episode == 2 && row.khHarem_hentai1Resource2 === req.params.res) || (episode == 3 && row.khHarem_hentai2Resource2 === req.params.res)) )
                        throw backEnd_err = '|Eros|Invalid API Request: Resource Directory input does not match within my records.'
                res.render(`player`, { json: row, ep: episode });
        }
        catch (err) {
                if(backEnd_err)
                        res.send(err.toString().replace(/'/g, ''));
                else
                        console.log(err.stack);
        }
});

server.all('*', (req, res) => {
        return res.send('|Eros|403.14: Access Denied.');
});

server.listen(80);
console.log('Listening to http://localhost:80');

process.on('unhandledRejection', err => console.error(`${new Date().toUTCString()} | Uncaught Promise Error: \n${err.stack}`));