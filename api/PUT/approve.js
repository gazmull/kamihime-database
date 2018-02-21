const sql = require('sqlite');
const { WebhookClient } = require('discord.js');

const { hook, api } = require('../../auth');
const webhook = new WebhookClient(hook.id, hook.token);

class ApproveRequest {
  async execute(req, res) {
    const data = req.body;

    try {
      const isValidToken = data.token && data.token === api.token;
      if (!isValidToken) throw { code: 403, message: 'Invalid token.' };

      const character = await sql.get('SELECT khID, khApproved FROM kamihime WHERE khID = ?', data.id);
      if (!character) throw { code: 404, message: 'Character not found.' };

      const approveToggle = character.khApproved ? 0 : 1;
      await sql.run('UPDATE kamihime SET khApproved = ? WHERE khID = ?', approveToggle, data.id);

      if (hook)
        webhook.send(`${data.user} ${approveToggle ? 'approved' : 'disapproved'} ${data.name} (${data.id})`);
      console.log(`${new Date().toLocaleString()}: [A/D]: Character: ${data.name} (${data.id}) | By: ${data.user}`);
      res
        .status(200)
        .json({ name: data.name, id: data.id, approved: approveToggle, avatar: data.avatar });
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }
}

module.exports = ApproveRequest;