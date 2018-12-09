const { get } = require('snekfetch');

const { api } = require('../auth');

class Browser {
  constructor() {
    this.id = 'browser';
    this.method = 'get';
    this.route = ['/', '/browser'];
  }

  async execute(req, res, next) { // eslint-disable-line no-unused-vars
    try {
      const data = await get(`${api.url}list`);
      const list = data.body;
      const soul = list.soul;
      const eidolon = list.eidolon;
      const kamihime = list.kamihime;
      const ssra = kamihime.filter(k => k.khRarity === 'SSRA');
      const ssr = kamihime.filter(k => k.khRarity === 'SSR');
      const sr = kamihime.filter(k => k.khRarity === 'SR');
      const r = kamihime.filter(k => k.khRarity === 'R');
      const combined = soul.concat(eidolon, kamihime);
      const peeks = combined.sort((a, b) => b.peekedOn - a.peekedOn).slice(0, 50);

      res.render('browser', {
        Souls: soul.sort((a, b) => a.khName > b.khName ? 1 : -1),
        Eidolons: eidolon,
        SSRAs: ssra,
        SSRs: ssr,
        SRs: sr,
        Rs: r,
        Peeks: peeks
      });
    } catch (err) {
      errorHandler(res, { code: 500, message: err.message }); // eslint-disable-line no-undef
      if (err.stack) console.log(err.stack);
    }
  }
}

module.exports = Browser;
