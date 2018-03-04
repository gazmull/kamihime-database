const { get } = require('snekfetch');
const Collection = require('../utils/Collection');

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
      const kamihime = this.toCollection(list.kamihime);
      const ssra = kamihime.filter(k => k.khRarity === 'SSRA');
      const ssr = kamihime.filter(k => k.khRarity === 'SSR');
      const sr = kamihime.filter(k => k.khRarity === 'SR');
      const r = kamihime.filter(k => k.khRarity === 'R');
      const peeks = kamihime.sort((a, b) => b.peekedOn - a.peekedOn);

      res.render('browser', {
        Souls: list.soul,
        Eidolons: list.eidolon,
        SSRAs: this.toArray(ssra),
        SSRs: this.toArray(ssr),
        SRs: this.toArray(sr),
        Rs: this.toArray(r),
        Peeks: this.toArray(peeks).slice(0, 50)
      });
    } catch (err) {
      errorHandler(res, { code: 500, message: err.message }); // eslint-disable-line no-undef
      if (err.stack) console.log(err.stack);
    }
  }

  toCollection(result) {
    const collection = new Collection();
    for (let i = 0; i < result.length; i++)
      collection.set(result[i].khID, result[i]);

    return collection;
  }

  toArray(result) {
    const array = [];
    for (const [k, v] of result) // eslint-disable-line no-unused-vars
      array.push(v);

    return array;
  }
}

module.exports = Browser;
