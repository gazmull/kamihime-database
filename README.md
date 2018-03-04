[![Build Status](https://travis-ci.org/gazmull/kamihime-database.svg?branch=master)](https://travis-ci.org/gazmull/kamihime-database)
# Kamihime Database

Website + RESTful (JSON) API for Kamihime Database.

* [Eros Dev](http://erosdev.thegzm.space)
* [Eros Support](http://support.thegzm.space)
* [Add Eros Instead?](http://addbot.thegzm.space)
* [Browse Harem Scenes](http://kamihimedb.thegzm.space)

# Requirements
* [Scenario Files from 'snek'](https://github.com/gazmull/kh-snek)
  * Move the generated folders (`kh-snek/static`) to this repository's static
    * Example: `$ mv kh-snek/static/scenarios kamihime-database/static/`
  * Or, configure `snek`'s `auth.js` to extract downloaded contents to `kamihime-database/static/scenarios/`
  * `node .` to boop

# Notice
* Please configure `auth.json`. Get its template from `auth.example.json`.
    * Basically: `database`, `hostAddress`, `apiURL` `hookID`, and `hookToken`

# Dependencies
* [express/body-parser/compression homepage](https://github.com/expressjs)
* [pug homepage](https://github.com/pugjs/pug)
* [sqlite homepage](https://github.com/mapbox/node-sqlite3)
* [canvas homepage](https://github.com/Automattic/node-canvas/wiki)
* [discord.js](https://github.com/discordjs/discord.js)

# Contributing
* You have to fork this repository, and follow the project's ESLint configuration. Run `npm test` or `yarn test` to verify if your build is passing. Failing build will be rejected.
  * `npm install eslint` or `yarn add eslint` to install ESLint.

# License
  MIT