import { Request, Response } from 'express';
import Api from '../../struct/Api';

const sessionPass: string[] = [
  'nyan cats :OOOOO',
  'im firin mah laser',
  'motherfuckingcanes',
  'nevergonnarollyouup',
  'bingas!!!!!',
  'ohwowshitemane',
  'cjbustabustamusta',
  'whatafuckingnigger',
  'eksdeeboi:(',
  'keep up mothafucka',
  'trainfollowthedamn',
  'chinarepublicof',
  'Just Monika.',
  'It\'s Everyday BrOOOOOOOOOOOOOOOOOOOOOH',
  'My Longest OOOOOOOOOOOOOOOOOOOOOH Ever',
  'What is your favourite kamihime?',
  'lolicon everywhere',
  'I\'m actually gay. If you have decoded this, please don\'t tell anyone regarding this.',
  ':OOOOOOOOOOOOOOOOOOOO',
  'xD vs XD vs xd, which one?',
  'ENGRISH MOTHERFUCKER DO YOU SPEAK IT?',
  'Bulok Gameclub'
];

export = PostSessionRequest;
class PostSessionRequest extends Api {
  constructor() {
    super({
      method: 'POST',
      cooldown: 5,
      max: 1
    });
  }

  async exec(req: Request, res: Response): Promise<void> {
    const data = req.body;

    try {
      await this._hasData(data);
      const { user, id, name } = data;
      const characterFields: string[] = ['id', 'name'];
      const [ character ] = await this.server.util.db('kamihime').select(characterFields)
        .where('id', id)
        .limit(1);

      if (!character) throw { code: 404, message: 'Character not found.' };

      const [ session ] = await this.server.util.db('sessions').select()
        .where('user', user)
        .andWhere('cID', id)
        .limit(1);

      if (session) {
        res
          .status(202)
          .json({
            code: 202,
            message: 'Already existing session.',
            cID: session.cID,
            sID: session.sID,
            sPW: session.sPW
          });

        return;
      }

      const sessions: any[] = await this.server.util.db('sessions').select('count(cID)')
          .where('user', user);

      if (sessions.length > 3)
        throw { code: 429, message: `Too many sessions active. [${sessions.length} sessions active]` };

      const uniqueID: string = Math.random().toString(36).substr(2, 16);
      const uniqueKey: string = Buffer.from(
        sessionPass[Math.floor(Math.random() * sessionPass.length)]
          .slice(Math.floor(Math.random() * 3), -2)
      ).toString('base64');

      await this.server.util.db('sessions')
        .insert({
          sID: uniqueID,
          sPW: uniqueKey,
          sAge: 'now()',
          cID: id,
          user
        });

      const [ newSession ] = await this.server.util.db('sessions').select()
        .where('user', user)
        .andWhere('cID', id)
        .limit(1);

      await this.server.util.webHookSend(`${user}'s session for ${character.name} (${character.id}) has been created.`);

      this.server.util.logger.status(`[A] API: Character-Session: ${name} (${id}) | By: ${user}`);

      res
        .status(200)
        .json(newSession);
    } catch (err) { this.server.util.handleApiError(res, err); }
  }
}
