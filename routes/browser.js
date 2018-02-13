const sql = require('sqlite');

class Browser {
  constructor() {
    this.id = 'browser';
    this.method = 'get';
    this.route = ['/', '/browser'];
  }

  async execute(req, res, next) {
    try {
      const rowSoul    = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSoul IS 1 ORDER BY khName ASC');
      const rowEidolon = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khEidolon IS 1 ORDER BY khName ASC');
      const rowSSRA    = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 1 AND khRare IS 1 ORDER BY khName ASC');
      const rowSSR     = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2, khHarem_hentai2, khHarem_hentai2Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 1 AND khRare IS 0 ORDER BY khName ASC');
      const rowSR      = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2, khHarem_hentai2, khHarem_hentai2Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 0 AND khRare IS 0 AND khSoul IS 0 and khEidolon IS 0 ORDER BY khName ASC');
      const rowR       = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 0 AND khRare IS 1 ORDER BY khName ASC');
      const rowPeek    = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2, khHarem_hentai2, khHarem_hentai2Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 ORDER BY peekedOn DESC LIMIT 30');

      res.render('browser', {
        Souls: rowSoul,
        Eidolons: rowEidolon,
        SSRAs: rowSSRA,
        SSRs: rowSSR,
        SRs: rowSR,
        Rs: rowR,
        Peeks: rowPeek
      });
    } catch (err) {
      res.send(err);
    }
  }
}

module.exports = Browser;