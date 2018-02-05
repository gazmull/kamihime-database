const sql = require('sqlite');

module.exports.execute = async (req, res) => {
  const id = req.params.id;
  const validID = ['s', 'k', 'e'];
  const checkID = id.length === 5 &&
    validID.includes(id.charAt(0)) &&
    !isNaN(id.slice(1));

  try {
    if(!checkID) throw { status: 403, message: 'Invalid ID.' };

    const row = await sql.get(`SELECT * FROM kamihime WHERE khID = ?`, id);
    if(!row) throw { status: 404, message: 'Character not found.' };
    res
      .status(200)
      .json(row);
  }
  catch (err) {
    res
      .status(err.status)
      .json({ error: err.message });
  }
};