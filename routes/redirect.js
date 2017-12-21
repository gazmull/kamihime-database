const Discord               = require('discord.js');
const sql                   = require('sqlite');
const { hookID, hookToken } = require('../auth.json');
const jsonExtract           = require('../utils/jsonExtract');
const dbHook                = new Discord.WebhookClient(hookID, hookToken);

const t1Souls = [
    'Lancelot', 'Olivier', 'Vivian', 'Merlin', 'Beowulf', 'Van Helsing', 'Billy the Kid', 'Spartacus', 'Crowley', 'Yukimura'
];

const t2Souls = [
'Gawain', 'Roland', 'Cassiopeia', 'Rosenkreuz', 'Gilgamesh', 'Asmund', 'Granuaile', 'Achilles', 'Cagliostro', 'Masamune'
];

module.exports = {
    async execute(req, res) {
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
    }
};