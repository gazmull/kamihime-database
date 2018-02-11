const sql = require('sqlite');

module.exports.execute = async (req, res) => {
  try {
    const fields = [
      'khID', 'khName',
    ];

    const rowSouls    = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSoul IS 1 ORDER BY ROWID DESC LIMIT 3`);
    const rowEidolons = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khEidolon IS 1 ORDER BY ROWID DESC LIMIT 3`);
    const rowSSRA     = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 1 AND khRare IS 1 ORDER BY ROWID DESC LIMIT 3`);
    const rowSSR      = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 1 AND khRare IS 0 ORDER BY ROWID DESC LIMIT 3`);
    const rowSR       = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 0 AND khRare IS 0 AND khSoul IS 0 and khEidolon IS 0 ORDER BY ROWID DESC LIMIT 3`);
    const rowR        = await sql.all(`SELECT ${fields} FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 0 AND khRare IS 1 ORDER BY ROWID DESC LIMIT 3`);
    
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