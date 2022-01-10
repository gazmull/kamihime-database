import { Request, Response } from 'express';
import ApiRoute from '../../../struct/ApiRoute';

/**
 * @api {get} /credits credits
 * @apiName GetCredits
 * @apiGroup Site Specific
 * @apiDescription Specify special thanks
 */
export default class GetCredits extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'credits',
      max: 1,
      method: 'GET',
      route: [ '/credits' ]
    });
  }

  public async exec (req: Request, res: Response) {
    res
      .status(200)
      .send([
        '<pre style="word-wrap: break-word; white-space: pre-wrap;">',
        'Characters images, sounds, and stories are properties of DMM Games (games.dmm.co.jp).',
        'This site does not claim ownership of the properties mentioned above and only serves as a site for information purposes.',
        'All properties above were obtained via playing through the game and/or acquired from https://kamihime-project.fandom.com.',
        '\n',
        'Modules used:',
        'anchorme, bufferutil, canvas, cookie-parser, discord.js, express, fs-extra, fuse.js, helmet, knex, mysql2, node-fetch, nodemw,'
        + 'pug, nanoid, bootstrap, howler, jquery, js-cookie, apidoc, autoprefixer, browser-sync, gulp, nodemon, postcss, sass, terser, tslint, typescript, sweetalert2',
        '</pre>',
      ].join('\n'));
  }
}
