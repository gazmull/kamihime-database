const sql = require('sqlite');

class ListRequest {
  async execute(req, res) { // eslint-disable-line no-unused-vars
    try {
      const fields = {
        soul: [
          'khID', 'khName', 'khInfo_avatar',
          'khType',
          'khTier',
          'peekedOn', 'khLoli',
          'khHarem_intro', 'khHarem_introResource1', 'khHarem_introFile',
          'khHarem_hentai1', 'khHarem_hentai1Resource1', 'khHarem_hentai1Resource2'
        ],
        eidolon: [
          'khID', 'khName', 'khInfo_avatar',
          'khElement',
          'khRarity',
          'peekedOn', 'khLoli',
          'khHarem_intro', 'khHarem_introResource1', 'khHarem_introFile',
          'khHarem_hentai1', 'khHarem_hentai1Resource1', 'khHarem_hentai1Resource2'
        ],
        kamihime: [
          'khID', 'khName', 'khInfo_avatar',
          'khElement', 'khType',
          'khRarity',
          'peekedOn', 'khLoli',
          'khHarem_intro', 'khHarem_introResource1', 'khHarem_introFile',
          'khHarem_hentai1', 'khHarem_hentai1Resource1', 'khHarem_hentai1Resource2',
          'khHarem_hentai2', 'khHarem_hentai2Resource1', 'khHarem_hentai2Resource2'
        ]
      };

      const rowLegendary = await sql.all(`SELECT ${fields.soul} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khTier='Legendary' ORDER BY khName ASC`);
      const rowElite = await sql.all(`SELECT ${fields.soul} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khTier='Elite' ORDER BY khName ASC`);
      const rowStandard = await sql.all(`SELECT ${fields.soul} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khTier='Standard' ORDER BY khName ASC`);
      const rowEidolons = await sql.all(`SELECT ${fields.eidolon} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 1 ORDER BY khName ASC`);
      const rowSSRA = await sql.all(`SELECT ${fields.kamihime} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='SSRA' ORDER BY khName ASC`);
      const rowSSR = await sql.all(`SELECT ${fields.kamihime} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='SSR' ORDER BY khName ASC`);
      const rowSR = await sql.all(`SELECT ${fields.kamihime} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='SR' ORDER BY khName ASC`);
      const rowR = await sql.all(`SELECT ${fields.kamihime} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='R' ORDER BY khName ASC`);

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

module.exports = ListRequest;