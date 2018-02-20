const { get } = require('snekfetch');
const apiURL = require('../auth.json');

class Dashboard {
  constructor() {
    this.id= 'dashboard';
    this.method = 'get';
    this.route = ['/dashboard'];
  }

  async execute(req, res, next) {
    const query = req.query;
    try {
      if(Object.keys(query).length === 0)
        throw { code: 404, message: 'Missing queries.' };

      // localhost/dashboard?character={khID}&id={sID}&k={sPW}
      const data  =  await get(`${apiURL}id/${query.character}`);
      const character = data.body;
      const session = await sql.get('SELECT * FROM sessions WHERE sID = ?', query.id);

      if(!session)
        throw { code: 404, message: 'Session not found.' };
      else if(query.k !== session.sPW)
        throw { code: 403, message: 'Session key doesn\'t match within my records.' };

      res.render('dashboard', { json: row, user: session });
    }
    catch (err) { errorHandler(res, err); }
  }
}

module.exports = Dashboard;