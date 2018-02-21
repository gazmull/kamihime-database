const sql = require('sqlite');
const { WebhookClient } = require('discord.js');

const { hook, api } = require('../../auth');
const webhook = new WebhookClient(hook.id, hook.token);

class UpdateRequest {
  async execute(req, res) {
    const data = req.body;

    try {
      const isValidToken = data.token && data.token === api.token;
      if (!isValidToken) throw { code: 403, message: 'Invalid token.' };

      const character = await sql.get('SELECT khID FROM kamihime WHERE khID = ?', data.id);
      if (!character) throw { code: 404, message: 'Character not found.' };

      const info = {
        khName: data.name || null,
        khInfo_avatar: data.avatar || null,
        khRarity: data.rarity || null,
        khTier: data.tier || null,
        khElement: data.element || null,
        khType: data.type || null,
        khEngrishName: data.engrishName || null,
        khHarem_intro: data.harem_intro || null,
        khHarem_introResource1: data.harem_introResource1 || null,
        khHarem_introFile: data.harem_introFile || null,
        khHarem_hentai1: data.harem_hentai1 || null,
        khHarem_hentai1Resource1: data.harem_hentai1Resource1 || null,
        khHarem_hentai1Resource2: data.harem_hentai1Resource2 || null,
        khHarem_hentai2Resource1: data.harem_hentai1Resource1 || null,
        khHarem_hentai2Resource2: data.harem_hentai2Resource2 || null
      };
      const array = [];

      for (const key in info) {
        if (!info[key]) continue;

        if (isNaN(info[key]))
          array.push(` ${key}='${info[key].replace(/'/g, '\'\'')}'`);
        else
          array.push(` ${key}=${Number(info[key])}`);
      }

      if (array.length < 1) throw { code: 403, message: 'NULL datum detected.' };
      await sql.run(`UPDATE kamihime SET ${array.toString()} WHERE khID = ?`, data.id);
      await sql.run('DELETE FROM sessions WHERE user = ? AND cID = ?', data.user, data.id);

      if (hook)
        await webhook.send(
          `${data.user} updated ${data.name} (${data.id}): \`\`\`py\n${array.join('\n')}\n\`\`\``
        );
      console.log(`${new Date().toLocaleString()}: [U] API: Character: ${data.name} (${data.id}) | By: ${data.user}`);
      res
        .status(200)
        .json({ id: data.id, name: data.name, avatar: data.avatar });
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }
}

module.exports = UpdateRequest;