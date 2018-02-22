const sql = require('sqlite');

class LatestRequest {
  async execute(req, res) { // eslint-disable-line no-unused-vars
    try {
      const fields = ['khID', 'khName'];

      const rowSouls = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khTier='Legendary' OR khTier='Elite' OR khTier='Standard' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowEidolons = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 1 AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowSSRA = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='SSRA' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowSSR = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='SSR' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowSR = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='SR' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);
      const rowR = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khEidolon IS 0 AND khRarity='R' AND khApproved=1 ORDER BY ROWID DESC LIMIT 3`);

      res
        .status(200)
        .json({
          soul: rowSouls,
          eidolon: rowEidolons,
          ssra: rowSSRA,
          ssr: rowSSR,
          sr: rowSR,
          r: rowR
        });
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }
}

module.exports = LatestRequest;