import { Request, Response } from 'express';
import { IKamihime, ISession } from '../../../../typings';
import ApiRoute from '../../../struct/ApiRoute';
import ApiError from '../../../util/ApiError';
import * as fs from 'fs-extra';

/**
 * @api {put} /update update
 * @apiName PutUpdate
 * @apiGroup Kamihime Specific
 * @apiDescription Updates an item from the database.
 *
 * **Warning**: You have to do `POST /session` first to obtain an authorization to update an item.
 * @apiPermission Owner Only
 *
 * @apiParam (Request Body) {string} id The item's ID.
 * @apiParam (Request Body) {string} name The item's name.
 * @apiParam (Request Body) {string} user The user's ID.
 * @apiParam (Request Body) {string} token The user's authentication token.
 * @apiParam (Request Body) {string} harem1Title The Episode 1 Title.
 * @apiParam (Request Body) {string} harem1Resource1 The Episode 1 Story Resource ID.
 * @apiParam (Request Body) {string} harem2Title The Episode 2 Title.
 * @apiParam (Request Body) {string} harem2Resource1 The Episode 2 Story Resource ID.
 * @apiParam (Request Body) {string} harem2Resource2 The Episode 2 Scenario Resource ID.
 * @apiParam (Request Body) {string} harem3Title The Episode 3 Title.
 * @apiParam (Request Body) {string} harem3Resource1 The Episode 3 Story Resource ID.
 * @apiParam (Request Body) {string} harem3Resource2 The Episode 3 Scenario Resource ID.
 * @apiParam (Request Body) {string} rarity The item's rarity if it ever has one.
 * @apiParam (Request Body) {string} [tier=null] For Soul character.
 *
 * @apiSuccess {string} id The item's ID.
 * @apiSuccess {string} name The item's name.
 * @apiSuccess {PathLike} avatar The item's portrait image path.
 * @apiSuccessExample {json} Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "id": "k0001",
 *    "name": "Satan",
 *    "avatar": "portrait/Satan Portrait.png"
 *  }
 */
export default class PutUpdateRequest extends ApiRoute {
  constructor () {
    super({
      cooldown: 5,
      id: 'update',
      max: 1,
      method: 'PUT',
      route: [ '/update' ]
    });
  }

  public async exec (req: Request, res: Response) {
    let data = req.body;
    const manual: boolean = Boolean(req.query.manual as string);

    if (!res.locals.user.admin) {
      await this._hasData(data);

      const [ session ]: ISession[] = await this.server.util.db('sessions').select('userId')
        .where({ userId: data.user, characterId: data.id });

      if (!session) throw new ApiError(401, 'You must create a session before updating a character.');
    }

    const fields: string[] = [ 'id', 'loli' ];
    const [ character ]: IKamihime[] = await this.server.util.db('kamihime').select(fields)
      .where('id', data.id)
      .limit(1);

    if (!character) throw new ApiError(404);

    const {
      harem1Resource1,
      harem1Title,
      harem2Resource1,
      harem2Resource2,
      harem2Title,
      harem3Resource1,
      harem3Resource2,
      harem3Title,
      id,
      name,
      rarity,
      tier
    } = data;
    data = this._filter({
      harem1Resource1,
      harem1Title,
      harem2Resource1,
      harem2Resource2,
      harem2Title,
      harem3Resource1,
      harem3Resource2,
      harem3Title,
      name,
      rarity,
      tier
    }, el => el);

    if (!Object.keys(data).length) throw new ApiError(401, 'Cannot accept empty character data.');

    await this.server.util.db('kamihime').update(data)
      .where({ id });

    const user = data.user || req.signedCookies.userId;

    if (!res.locals.user.admin)
      await this.server.util.db('sessions')
        .where({ userId: user, characterId: id })
        .del();

    if (manual) {
      await this.__updateAssets(data, character.id);
      await this.server.util.db('kamihime').update({ mUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ') })
        .where({ id });
    }

    if (this.client.auth.discord.dbReportChannel)
      await this.server.util.discordSend(this.client.auth.discord.dbReportChannel, [
        `**${user}** ${manual ? '__significantly__ ' : ''}updated **${name}** (**${id}**):\`\`\``,
        Object.entries(data).map(el => {
          const [ key, value ] = el;

          return `${key}='${value}'`;
        }).join('\n'),
        '```',
      ].join('\n'));

    this.server.util.logger.info(`[U] API: Character: ${name} (${id}) | By: ${user}`);
    await this.server.startKamihimeCache(true);

    const { avatar } = this.server.kamihime.find(el => el.id === id);

    res
      .status(200)
      .json({ name, id, avatar });
  }

  private async __updateAssets (character: IKamihime, id: string) {
    const sceneZipsDir = this.server.auth.dirs.h.zips;
    const updatedZips = [];
    let zips = await fs.readdir(`${sceneZipsDir}${id}`);

    if (!zips.length) return;

    for (const zip of zips) {
      const nameRegex = /(.+)(_\w+\.zip)/i;
      const name = nameRegex.exec(zip);
      const updatedName = character.name;

      if ( !name || (name && name[1] !== updatedName) ) {
        const newZip = zip.replace(nameRegex, `${updatedName}$2`);
        const oldPath = `${sceneZipsDir}${zip}`;
        const newPath = `${sceneZipsDir}${newZip}`

        await fs.rename(oldPath, newPath.trim());

        updatedZips.push([ zip, newZip ]);
      }
    }

    return this.server.util.discordSend(this.client.auth.discord.dbReportChannel, [
      `**${character.name}** (**${id}**)'s zips has been updated:\`\`\`diff`,
      updatedZips.map(e => `- ${e[0]}\n+ ${e[1]}`).join('\n\n'),
      '```',
    ].join('\n'));
  }
}
