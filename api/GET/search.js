const sql = require('sqlite');

class SearchRequest {
  async execute(req, res) {
    try {
      const query = decodeURI(req.query.name).replace(/['()]/g, '');
      if (Object.values(query).length < 2) throw { code: 403, message: 'Query must be 2 or more characters.' };

      const col = 'REPLACE(REPLACE(REPLACE(khName, \'(\', \'\'), \')\', \'\'), "\'", \'\')';
      const rows = await sql.all(
        `SELECT khID, khName FROM kamihime WHERE ${col} LIKE ? LIMIT 10`,
        this.sanitiseQuery(query)
      );
      res
        .status(200)
        .json(rows);
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }

  sanitiseQuery(query) {
    if (query.length > 4)
      return `%${query
        .replace(/'/g, '\'\'')
        .replace(/[aeiou]/gi, '_')
      }%`;

    return `${query.replace(/'/g, '\'\'')}%`;
  }
}

module.exports = SearchRequest;