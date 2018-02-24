const sql = require('sqlite');
const { WebhookClient } = require('discord.js');

const { hook, api } = require('../../auth');
const webhook = new WebhookClient(hook.id, hook.token);

class AddRequest {
  async execute(req, res) {
    const data = req.body;

    try {
      const isValidToken = data.token && data.token === api.token;
      if (!isValidToken) throw { code: 403, message: 'Invalid token.' };

      const character = await sql.get('SELECT khID FROM kamihime WHERE khID = ?', data.id);
      if (character) throw { code: 403, message: 'Character already exists.' };

      const info = {
        khID: data.id || null,
        khName: data.name || null,
        khLoli: data.loli || null,
        khEidolon: data.eidolon || null,
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
        khHarem_hentai2: data.harem_hentai2 || null,
        khHarem_hentai2Resource1: data.harem_hentai2Resource1 || null,
        khHarem_hentai2Resource2: data.harem_hentai2Resource2 || null,
        peekedOn: 0
      };
      const keyArray = [];
      const valueArray = [];

      for (const key in info) {
        if (!(info[key] || key === 'peekedOn') || !isNaN(key)) continue;

        keyArray.push(key);
        valueArray.push(`'${info[key]}'`);
      }

      if (keyArray.length < 1) throw { code: 403, message: 'NULL datum detected.' };
      await sql.run(`INSERT INTO kamihime (${keyArray.join(', ')}) VALUES (${valueArray.join(', ')});`);

      if (hook)
        await webhook.send(
          `${data.user} added: \`\`\`py\n${this.mappedArray(keyArray, valueArray)}\n\`\`\``
        );
      console.log(`${new Date().toLocaleString()}: [A] API: Character: ${data.name} (${data.id}) | By: ${data.user}`);
      res
        .status(201)
        .json({ name: data.name, id: data.id, avatar: data.avatar });
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }

  mappedArray(keyArray, valueArray) {
    const array = [];
    for (let i = 0; i < keyArray.length; i++)
      array.push(`${keyArray[i]}='${valueArray[i]}'`);

    return array.join('\n');
  }
}

module.exports = AddRequest;