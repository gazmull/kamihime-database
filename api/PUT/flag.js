const sql = require('sqlite');
const { WebhookClient } = require('discord.js');

const { hook, api } = require('../../auth');
const webhook = new WebhookClient(hook.id, hook.token);

class FlagRequest {
  async execute(req, res) {
    const data = req.body;

    try {
      const isValidToken = data.token && data.token === api.token;
      if (!isValidToken) throw { code: 403, message: 'Invalid token.' };

      const character = await sql.get('SELECT khID, khLoli FROM kamihime WHERE khID = ?', data.id);
      if (!character) throw { code: 404, message: 'Character not found.' };

      const loliToggle = character.khLoli ? 0 : 1;
      await sql.run('UPDATE kamihime SET khLoli = ? WHERE khID = ?', loliToggle, data.id);

      if (hook)
        await webhook.send(`${data.user} ${loliToggle ? 'flagged' : 'unflagged'} ${data.name} (${data.id}).`);
      console.log(`${new Date().toLocaleString()}: [F] API: Character: ${data.name} (${data.id}) | By: ${data.user}`);
      res
        .status(200)
        .json({ name: data.name, id: data.id, loli: loliToggle, avatar: data.avatar });
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }
}

module.exports = FlagRequest;