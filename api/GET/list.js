const sql = require('sqlite');

class ListRequest {
  async execute(req, res) {
    try {
      const fields = [
        'khID', 'khName',
        'khElement', 'khType',
        //'khRarity', 'khTier',
        //'khWeapon1', 'khWeapon2'
      ];

      const rowSouls    = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSoul IS 1 ORDER BY khID ASC`);
      const rowEidolons = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khEidolon IS 1 ORDER BY khID ASC`);
      const rowSSRA     = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 1 AND khRare IS 1 ORDER BY khID ASC`);
      const rowSSR      = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 1 AND khRare IS 0 ORDER BY khID ASC`);
      const rowSR       = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 0 AND khRare IS 0 AND khSoul IS 0 and khEidolon IS 0 ORDER BY khID ASC`);
      const rowR        = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 0 AND khRare IS 1 ORDER BY khID ASC`);
      
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
    }
    catch (err) { errorHandler(res, err); }
  }
}

module.exports = ListRequest;