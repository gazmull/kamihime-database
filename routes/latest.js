const snekfetch = require('snekfetch');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');

const { apiURL } = require('../auth.json');

class Latest {
  constructor() {
    this.id = 'latest';
    this.method = 'get';
    this.route = ['/latest'];
  }
  
  async execute(req, res, next) {
    try {
      const rawData = await snekfetch.get(`${apiURL}latest`);
      let result = rawData.body;
      const caseError = result.error || null;

      if(caseError) throw { code: caseError.code, message: caseError.message };

      const file = fs.readFileSync(path.join(__dirname, '..', 'static', 'latest', 'base.png'));
      if (typeof file === 'undefined') throw { code: 500, message: 'Base image file is missing.' };
      const image = new Canvas.Image;
      image.src = file;
      
      const canvas = new Canvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      ctx.font = '11px Arial';
      ctx.fillStyle = 'white';

      result = {
        soul: result.soul,
        eidolon: result.eidolon,
        ssr: result.ssra.concat(result.ssr),
        sr: result.sr,
        r: result.r
      };
      
      const positions = {
        soul: { x: 14, y: 63 },
        eidolon: { x: 174, y: 63 },
        ssr: { x: 334, y: 63 },
        sr: { x: 14, y: 118 },
        r: { x: 174, y: 118 }
      };

      for (const category of Object.keys(result)) {
        ctx.fillText(
          result[category]
            .map(c => c.khName)
            .join('\n'),
          positions[category].x,
          positions[category].y
        );
      }

      res.setHeader('Content-Type', 'image/png');
      canvas.pngStream().pipe(res);
    }
    catch (err) { errorHandler(res, err); }
  }
}

module.exports = Latest;