const sql = require('sqlite');

class IdRequest {
  async execute(req, res) {
    const id = req.params[0];
    const validID = ['s', 'k', 'e'];
    const checkID = id && id.length === 5 &&
      validID.includes(id.charAt(0)) &&
      !isNaN(id.slice(1));

    try {
      if (!checkID) throw { code: 403, message: 'Invalid ID.' };

      const fields = [
        'khID', 'khName',
        'khInfo_avatar',
        'khLoli', 'peekedOn',
        'khHarem_intro', 'khHarem_introResource1', 'khHarem_introFile',
        'khHarem_hentai1', 'khHarem_hentai1Resource1', 'khHarem_hentai1Resource2',
        'khHarem_hentai2', 'khHarem_hentai2Resource2', 'khHarem_hentai2Resource2'
      ];
      const row = await sql.get(`SELECT ${fields} FROM kamihime WHERE khID = ?`, id);
      if (!row) throw { code: 404, message: 'Character not found.' };
      res
        .status(200)
        .json(row);
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }
}

module.exports = IdRequest;