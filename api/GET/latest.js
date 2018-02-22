const sql = require('sqlite');

class LatestRequest {
  async execute(req, res) { // eslint-disable-line no-unused-vars
    try {
      const fields = {
        soul: [
          'khID', 'khName', 'khInfo_avatar',
          'khType',
          'khTier',
          'peekedOn',
          'khHarem_intro', 'khHarem_introResource1', 'khHarem_introFile',
          'khHarem_hentai1', 'khHarem_hentai1Resource1', 'khHarem_hentai1Resource2'
        ],
        eidolon: [
          'khID', 'khName', 'khInfo_avatar',
          'khElement',
          'khRarity',
          'peekedOn',
          'khHarem_intro', 'khHarem_introResource1', 'khHarem_introFile',
          'khHarem_hentai1', 'khHarem_hentai1Resource1', 'khHarem_hentai1Resource2'
        ],
        kamihime: [
          'khID', 'khName', 'khInfo_avatar',
          'khElement', 'khType',
          'khRarity',
          'peekedOn',
          'khHarem_intro', 'khHarem_introResource1', 'khHarem_introFile',
          'khHarem_hentai1', 'khHarem_hentai1Resource1', 'khHarem_hentai1Resource2',
          'khHarem_hentai2', 'khHarem_hentai2Resource2', 'khHarem_hentai2Resource2'
        ]
      };

      const rowLegendary = await sql.all(`SELECT ${fields.soul} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khTier='Legendary' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowElite = await sql.all(`SELECT ${fields.soul} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khTier='Elite' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowStandard = await sql.all(`SELECT ${fields.soul} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khTier='Standard' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowEidolons = await sql.all(`SELECT ${fields.eidolon} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 1 AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowSSRA = await sql.all(`SELECT ${fields.kamihime} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='SSRA' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowSSR = await sql.all(`SELECT ${fields.kamihime} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='SSR' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowSR = await sql.all(`SELECT ${fields.kamihime} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='SR' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowR = await sql.all(`SELECT ${fields.kamihime} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='R' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);

      res
        .status(200)
        .json({
          soul: rowLegendary.concat(rowElite, rowStandard),
          eidolon: rowEidolons,
          kamihime: rowSSRA.concat(rowSSR, rowSR, rowR)
        });
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }
}

module.exports = LatestRequest;