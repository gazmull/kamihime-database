const sql = require('sqlite');
const { WebhookClient } = require('discord.js');

const { hook, api } = require('../../auth');
const webhook = new WebhookClient(hook.id, hook.token);

class DeleteRequest {
  async execute(req, res) {
    const data = req.body;

    try {
      const isValidToken = data.token && data.token === api.token;
      if (!isValidToken) throw { code: 403, message: 'Invalid token.' };

      const character = await sql.get('SELECT khID FROM kamihime WHERE khID = ?', data.id);
      if (!character) throw { code: 404, message: 'Character not found.' };

      await sql.run('DELETE FROM kamihime WHERE khID = ?', data.id);

      if (hook)
        await webhook.send(`${data.user} deleted ${data.name} (${data.id}).`);
      console.log(`${new Date().toLocaleString()}: [D] API: Character: ${data.name} (${data.id}) | By: ${data.user}`);
      res
        .status(200)
        .json({ id: data.id, name: data.name, avatar: data.avatar });
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }
}

module.exports = DeleteRequest;
