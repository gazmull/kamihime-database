const sql = require('sqlite');

module.exports.execute = async (req, res) => {
  const id = req.params.id;
  const validID = ['s', 'k', 'e'];
  const checkID = id.length === 5 &&
    validID.includes(id.charAt(0)) &&
    !isNaN(id.slice(1));

  try {
    if(!checkID) throw { status: 403, message: 'Invalid ID.' };

    const fields = [
      'khID', 'khName',
      'khInfo_avatar',
      'khLoli', 'peekedOn',
      'khHarem_intro', 'khHarem_introResource1', 'khHarem_introFile',
      'khHarem_hentai1', 'khHarem_hentai1Resource1', 'khHarem_hentai1Resource2',
      'khHarem_hentai2', 'khHarem_hentai2Resource2', 'khHarem_hentai2Resource2'
    ];
    const row = await sql.get(`SELECT ${fields} FROM kamihime WHERE khID = ? AND khApproved = 1`, id);
    if(!row) throw { status: 404, message: 'Character not found.' };
    res
      .status(200)
      .json(row);
  }
  catch (err) {
    if(!isNaN(err.status))
      res
        .status(err.status)
        .json({ error: err.message });
    else
      res
        .status(500)
        .json({ error: err.message });
  }
};