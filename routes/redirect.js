const { put } = require('snekfetch');
const { api } = require('../auth');

class Redirect {
  constructor() {
    this.id = 'redirect';
    this.method = 'post';
    this.route = ['/redirect'];
  }

  async execute(req, res) {
    const data = req.body;
    data.token = api.token;

    try {
      const form = await put(`${api.url}update`).send(data);
      const response = form.body;

      res.render('redirect', { id: response.id, name: response.name, avatar: response.avatar });
    } catch (err) {
      errorHandler(res, err); // eslint-disable-line no-undef
    }
  }
}

module.exports = Redirect;
