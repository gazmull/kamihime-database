import { Request, Response } from 'express';
import * as fs from 'fs-extra';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';

export default class PostHeroRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'hero',
      max: 1,
      method: 'PUT',
      route: [ '/hero' ]
    });
  }

  public async exec (req: Request, res: Response) {
    if (!res.locals.user.admin) throw new ApiError(401);

    const heroesToAdd = req.body.heroes as string[];

    if (!Array.isArray(heroesToAdd)) throw new ApiError(400);

    const heroesPath = `${process.cwd()}/.heroes`;

    try {
      await fs.stat(heroesPath);
    } catch { fs.writeFile(heroesPath, ''); }

    const listBuffer = await fs.readFile(heroesPath);
    const listText = listBuffer.toString();
    const list = listText.trim().split('\n').filter(e => e);
    const cleanedList = list
      .map(e => e.split(','))
      .filter((v, i, arr) => arr.findIndex(e => e[0] === v[0]) === i);

    const cleanedNewList = heroesToAdd.map(e => e.trim().split(','));
    const filteredToAdd = cleanedNewList.filter((v, i, arr) => arr.findIndex(e => e[0] === v[0]) === i);
    const finalisedToAdd = filteredToAdd.filter(v => !cleanedList.find(e => e[0] === v[0]));

    if (finalisedToAdd.length) {
      cleanedList.push(...finalisedToAdd);
      await fs.writeFile(heroesPath, cleanedList.map(e => `${e[0]},${e[1]}`).join('\n'));

      this.server.util.logger.info(`Successfully appended ${finalisedToAdd.length} heroes.`);
    }

    res
      .status(201)
      .send({ added: finalisedToAdd.length });
  }
}
