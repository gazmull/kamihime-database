const sql = require('sqlite');

module.exports = {
    async execute (req, res) {
        try {
            const rowSouls    = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSoul IS 1 ORDER BY khName ASC');
            const rowEidolons = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khEidolon IS 1 ORDER BY khName ASC');
            const rowSSRA     = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 1 AND khRare IS 1 ORDER BY khName ASC');
            const rowSSR      = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2, khHarem_hentai2, khHarem_hentai2Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 1 AND khRare IS 0 ORDER BY khName ASC');
            const rowSR       = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2, khHarem_hentai2, khHarem_hentai2Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 0 AND khRare IS 0 AND khSoul IS 0 and khEidolon IS 0 ORDER BY khName ASC');
            const rowR        = await sql.all('SELECT khID, khName, khInfo_avatar, khHarem_introFile, khHarem_hentai1, khHarem_hentai1Resource2 FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 0 AND khRare IS 1 ORDER BY khName ASC');

            res.render('browser', {
                Souls: rowSouls,
                Eidolons: rowEidolons,
                SSRAs: rowSSRA,
                SSRs: rowSSR,
                SRs: rowSR,
                Rs: rowR
            });
        }
        catch (err) { res.send(err); }
    }
};