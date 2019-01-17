import { Canvas, Image } from 'canvas';
import { Response } from 'express';
import * as fs from 'fs-extra';
import fetch from 'node-fetch';
import * as path from 'path';
import Route from '../struct/Route';

export default class LatestRoute extends Route {
  constructor () {
    super({
      id: 'latest',
      method: 'get',
      route: [ '/latest' ],
    });
  }

  public async exec (_, res: Response) {
    try {
      const data = await fetch(this.server.auth.api.url + 'latest', { headers: { Accept: 'application/json' } });
      let result = await data.json();

      if (result.error) throw result.error;

      const base = path.resolve(__dirname, '../../static/img/latest.png');
      const file = await fs.readFile(base);
      const image = new Image();
      image.src = file;

      const canvas = new Canvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      ctx.font = '11px Arial';
      ctx.fillStyle = 'white';

      result = {
        eidolon: result.eidolon,
        r: result.r,
        soul: result.soul,
        sr: result.sr,
        ssr: result['ssr+'].concat(result.ssr),
      };

      const positions = {
        eidolon: { x: 174, y: 63 },
        r: { x: 174, y: 118 },
        soul: { x: 14, y: 63 },
        sr: { x: 14, y: 118 },
        ssr: { x: 334, y: 63 },
      };

      for (const category in result)
        ctx.fillText(
          result[category]
            .map(c => c.name)
            .join('\n'),
          positions[category].x,
          positions[category].y,
        );

      res.setHeader('Content-Type', 'image/png');
      canvas.pngStream({ compressionLevel: 3, filters: canvas.PNG_FILTER_NONE }).pipe(res);
    } catch (err) { this.util.handleSiteError(res, err); }
  }
}
