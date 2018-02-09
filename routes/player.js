const sql = require('sqlite');

module.exports = {
    async execute(req, res) {
        let backEnd_err;
        try {

                if(Object.keys(req.params).length === 0)
                        return res.send('|Eros|Invalid API request: empty query.');
                // localhost/player/{khID}/{ep}/{resource2}
                const row  =  await sql.get(`SELECT * FROM kamihime WHERE khID='${req.params.id}'`);
                const episode = req.params.ep;

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

                const visitorFilter = recentVisitors.filter(r => r.address === req.ip && r.characterID === row.khID && r.ep === episode);
                let visitor = visitorFilter.first() || null;

                if(!visitor) {
                        const uniqueID = Math.random().toString(36).substr(2, 16);
                        await sql.run(`UPDATE kamihime SET peekedOn=${row.peekedOn + 1} WHERE khID='${row.khID}'`);
                        recentVisitors.set(uniqueID, { address: req.ip, expiration: Date.now(), characterID: row.khID, ep: episode});

                        visitor = recentVisitors.filter(r => r.address === req.ip && r.characterID === row.khID && r.ep === episode).first();
                        console.log(`PeekedOn Ratelimit: [${row.khName} - ${uniqueID}] Added ${visitor.address} on ${new Date(visitor.expiration).toLocaleString()}`);
                }
                res.render(`player`, { json: row, ep: episode });
        }
        catch (err) {
                if(backEnd_err)
                        res.send(err.toString().replace(/'/g, ''));
                else
                        console.log(err.stack);
        }
    }
};