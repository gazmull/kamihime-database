const sql = require('sqlite');
const { get } = require('snekfetch');

const { api } = require('../auth');

class Dashboard {
  constructor() {
    this.id = 'dashboard';
    this.method = 'get';
    this.route = ['/dashboard'];
  }

  async execute(req, res) {
    const query = req.query;
    try {
      if (Object.keys(query).length === 0)
        throw { code: 404, message: 'Missing queries.' };

      // localhost/dashboard?character={khID}&id={sID}&k={sPW}
      const data = await get(`${api.url}id/${query.character}`);
      const character = data.body;
      const session = await sql.get('SELECT * FROM sessions WHERE sID = ?', query.id);

      if (!session)
        throw { code: 404, message: 'Session not found.' };
      else if (query.k !== session.sPW)
        throw { code: 403, message: 'Session key doesn\'t match within my records.' };

      const characterInfo = {
        id: character.khID || null,
        name: character.khName || null,
        eidolon: character.khEidolon || null,
        avatar: character.khInfo_avatar || null,
        rarity: character.khRarity || null,
        tier: character.khTier || null,
        element: character.khElement || null,
        type: character.khType || null,
        engrishName: character.khEngrishName || null,
        harem_intro: character.khHarem_intro || null,
        harem_introResource1: character.khHarem_introResource1 || null,
        harem_introFile: character.khHarem_introFile || null,
        harem_hentai1: character.khHarem_hentai1 || null,
        harem_hentai1Resource1: character.khHarem_hentai1Resource1 || null,
        harem_hentai1Resource2: character.khHarem_hentai1Resource2 || null,
        harem_hentai2: character.khHarem_hentai2 || null,
        harem_hentai2Resource1: character.khHarem_hentai2Resource1 || null,
        harem_hentai2Resource2: character.khHarem_hentai2Resource2 || null
      };
      res.render('dashboard', { characterInfo, user: session });
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }
}

module.exports = Dashboard;