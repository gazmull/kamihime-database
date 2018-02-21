module.exports = {
  database: './provider/Eros.db',
  hostAddress: '127.0.0.1',
  rootURL: 'http://localhost/',

  api: {
    url: 'http://localhost/api/',
    token: 'null'
  },

  hook: {
    id: '319102712383799296',
    token: 'FfxhTJH6jt1Neve4LoR_8nXKqqjFQQ1ahShlzfszmuXhunK7AT6xsV3ZRzs6vdAts4YD'
  },

  rateLimits: {
    GET: {
      id: {
        max: 3,
        cooldown: 5
      },
      search: {
        max: 3,
        cooldown: 5
      },
      latest: {
        max: 1,
        cooldown: 5
      },
      list: {
        max: 1,
        cooldown: 5
      }
    },
    POST: {
      add: {
        max: 1,
        cooldown: 5
      },
      session: {
        max: 1,
        cooldown: 5
      }
    },
    PUT: {
      approve: {
        max: 1,
        cooldown: 5
      },
      flag: {
        max: 1,
        cooldown: 5
      },
      update: {
        max: 1,
        cooldown: 5
      }
    },
    DELETE: {
      max: 1,
      cooldown: 5
    }
  }
};