const sql = require('sqlite');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
    async execute(req, res) {
        try {
            // Aqcuire Latest 'Approved' Kamihime/Eidolon/Soul Limit 3 per Category
            // Some entries were sorted by ROWID instead, because they were added at irregular schedule.
            const rowSouls    = await sql.all('SELECT khID, khName FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSoul IS 1 ORDER BY ROWID DESC LIMIT 3');
            const rowEidolons = await sql.all('SELECT khID, khName FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khEidolon IS 1 ORDER BY ROWID DESC LIMIT 3');
            const rowSSRA     = await sql.all('SELECT khID, khName FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 1 AND khRare IS 1 ORDER BY ROWID DESC LIMIT 3');
            const rowSSR      = await sql.all('SELECT khID, khName FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 1 AND khRare IS 0 ORDER BY ROWID DESC LIMIT 3');
            const rowSR       = await sql.all('SELECT khID, khName FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 0 AND khRare IS 0 AND khSoul IS 0 and khEidolon IS 0 ORDER BY ROWID DESC LIMIT 3');
            const rowR        = await sql.all('SELECT khID, khName FROM kamihime WHERE khHarem_hentai1Resource2 IS NOT NULL AND khApproved IS 1 AND khSSR IS 0 AND khRare IS 1 ORDER BY ROWID DESC LIMIT 3');
            const result      = new Map();
            result
                    .set('soul', rowSouls)
                    .set('eido', rowEidolons)
                    .set('ssr', rowSSRA.concat(rowSSR))
                    .set('sr', rowSR)
                    .set('r', rowR);
    
            // Draw as image
            const file = fs.readFileSync(path.join(__dirname, '..', 'static', 'latest', 'base.png'));
            if (typeof file === 'undefined') throw new Error('Cannot resolve the base file.');
            const image = new Canvas.Image;
    
            const canvas = new Canvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            ctx.font = '11px Arial';
            ctx.fillStyle = 'white';
            image.src = file;
    
            for (category of result) {
                switch(category[0]) {
                    case 'soul':
                        ctx.fillText(category[1].map(c => c.khName).join('\n'), 14, 63);
                        break;
                    case 'eido':
                        ctx.fillText(category[1].map(c => c.khName).join('\n'), 174, 63);
                        break;
                    case 'ssr':
                        ctx.fillText(category[1].map(c => c.khName).join('\n'), 334, 63);
                        break;
                    case 'sr':
                        ctx.fillText(category[1].map(c => c.khName).join('\n'), 14, 118);
                        break;
                    case 'r':
                        ctx.fillText(category[1].map(c => c.khName).join('\n'), 174, 118);
                        break;
                }
            }
    
            // Render
            res.setHeader('Content-Type', 'image/png');
            canvas.pngStream().pipe(res);
        } catch (err) { res.send(err); }
    }
};