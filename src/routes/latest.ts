import { Response } from 'express';
import Route from '../struct/Route';
import fetch from 'node-fetch';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Image, Canvas } from 'canvas';


export default class LatestRoute extends Route {
  constructor() {
    super({
      id: 'latest',
      method: 'get',
      route: ['/latest']
    });
  }

  async exec(_, res: Response) {
    try {
      const data = await fetch(this.server.auth.api.url + 'latest');
      let result = await data.json();

      if (result.error) throw result.error;

      const base = path.resolve(__dirname, '../../static/img/latest.png');
      const file = await fs.readFile(base);
      const image = new Image;
      image.src = file;

      const canvas = new Canvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      ctx.font = '11px Arial';
      ctx.fillStyle = 'white';

      result = {
        soul: result.soul,
        eidolon: result.eidolon,
        ssr: result['ssr+'].concat(result.ssr),
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

      for (const category of Object.keys(result))
        ctx.fillText(
          result[category]
            .map(c => c.name)
            .join('\n'),
          positions[category].x,
          positions[category].y
        );

      res.setHeader('Content-Type', 'image/png');
      canvas.pngStream({ compressionLevel: 3, filters: canvas.PNG_FILTER_NONE }).pipe(res);
    } catch (err) { this.server.util.handleSiteError(res, err); }
  }
}
