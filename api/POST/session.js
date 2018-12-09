const sql = require('sqlite');
const { WebhookClient } = require('discord.js');

const { hook, api } = require('../../auth');
const webhook = new WebhookClient(hook.id, hook.token);

class SessionRequest {
  constructor() {
    this.sessionPass = [
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
  }

  async execute(req, res) {
    const data = req.body;

    try {
      const isValidToken = data.token && data.token === api.token;
      if (!isValidToken) throw { code: 403, message: 'Invalid token.' };

      const character = await sql.get('SELECT khID, khName FROM kamihime WHERE khID = ?', data.id);
      if (!character) throw { code: 404, message: 'Character not found.' };

      const session = await sql.get('SELECT * FROM sessions WHERE user = ? AND cID = ?', data.user, data.id);
      if (session)
        return res
          .status(202)
          .json({ code: 202, message: 'Already existing session.', cID: session.cID, sID: session.sID, sPW: session.sPW });

      const sessions = await sql.all('SELECT * FROM sessions WHERE user = ?', data.user);
      if (sessions.length > 3) throw { code: 429, message: 'Too many sessions active.', sessions: sessions.length };

      const uniqueID = Math.random().toString(36).substr(2, 16);
      const uniqueKey = Buffer.from(
        this.sessionPass[Math.floor(Math.random() * this.sessionPass.length)]
          .slice(Math.floor(Math.random() * 3), -2)
      ).toString('base64');
      await sql.run(
        'INSERT INTO sessions (sID, sPW, sAge, cID, user) VALUES (?, ?, ?, ?, ?)',
        uniqueID,
        uniqueKey,
        new Date(Date.now()).toLocaleString(),
        data.id,
        data.user
      );

      const newSession = await sql.get('SELECT * FROM sessions WHERE user = ? AND cID = ?', data.user, data.id);
      await webhook.send(`${data.user} session for ${character.khName} (${character.khID}) has been created.`);
      console.log(`${new Date().toLocaleString()}: [A] API: Character-Session: ${data.name} (${data.id}) | By: ${data.user}`);
      res
        .status(201)
        .json(newSession);
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }
}

module.exports = SessionRequest;
