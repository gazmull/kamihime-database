const sql = require('sqlite');
const { get } = require('snekfetch');

const { api } = require('../auth');

class Player {
  constructor() {
    this.id = 'player';
    this.method = 'get';
    this.route = ['/player/:id/:ep/:res'];
  }

  /* eslint-disable no-undef */
  async execute(req, res) {
    const params = req.params;
    try {
      if (Object.keys(params).length === 0)
        throw { code: 404, message: 'Missing parameters.' };

      // localhost/player/{khID}/{ep}/{resource2}
      const data = await get(`${api.url}id/${params.id}`);
      const character = data.body;
      const episode = params.ep;
      const resource = params.res;
      const isEidolon = character.khID.charAt(0) === 'e';
      const isSoul = character.khID.charAt(0) === 's';
      const isSsraOrR = character.khRarity === 'SSRA' || character.khRarity === 'R';

      if (!(episode > 1 && episode < 4))
        throw { code: 403, message: 'Invalid episode.' };
      else if ((isEidolon || isSoul || isSsraOrR) && episode === 3)
        throw { code: 403, message: 'Eidolon/Soul/SSRA/Rare cannot contain third harem episode.' };
      else if ((!character.khHarem_hentai1Resource2 && episode === 2) || (!character.khHarem_hentai2Resource2 && episode === 3))
        throw { code: 404, message: 'No such episode found.' };
      else if (
        !((episode === 2 && character.khHarem_hentai1Resource2 === resource) ||
        (episode === 3 && character.khHarem_hentai2Resource2 === resource))
      )
        throw { code: 403, message: 'Resource Directory input does not match within my records.' };

      this.rateLimit(req, character, episode);
      res.render('player', { json: character, ep: episode });
    } catch (err) {
      errorHandler(res, err);
      if (err.stack) console.log(err.stack);
    }
  }

  async rateLimit(req, character, episode) {
    const visitorFilter = recentVisitors.filter(r => r.address === req.ip && r.characterID === character.khID && r.ep === episode);
    let visitor = visitorFilter.first() || null;

    if (!visitor)
      try {
        const uniqueID = Math.random().toString(36).substr(2, 16);
        await sql.run(`UPDATE kamihime SET peekedOn=${character.peekedOn + 1} WHERE khID='${character.khID}'`);
        recentVisitors.set(uniqueID, { address: req.ip, expiration: Date.now(), characterID: character.khID, ep: episode });

        visitor = recentVisitors.filter(r => r.address === req.ip && r.characterID === character.khID && r.ep === episode).first();
        console.log(`${new Date().toLocaleString()}: [A] Peek: [${character.khName} - ${uniqueID}] Added ${visitor.address}`);
      } catch (err) {
        console.log(err.stack);
      }
  }
}

module.exports = Player;