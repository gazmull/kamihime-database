### 18/12/2017: Image retrieval for the Player has been re-routed to self-host
### 22/12/2017: Implemented dynamic signature for monitoring latest addition to the database
### 06/02/2018: Rewritten with built-in RESTful API for retrieving Character Information
---
# Kamihime Database

Website + RESTful (JSON) API for Kamihime Database.

* [Eros Dev](http://erosdev.thegzm.space)
* [Eros Support](http://support.thegzm.space)
* [Add Eros Instead?](http://addbot.thegzm.space)
* [Browse Harem Scenes](http://kamihimedb.thegzm.space)

# Requirements
* [Scenario Files from 'snek'](https://bitbucket.org/gazmull/snek)
  * Move the generated folders (`snek/static`) to this repository's static
    * Example: `$ mv snek/static/scenarios kamihime-database/static/`
  * Or move `snek`'s `index.js` to this repository and rename it as `snek.js`
    * Make sure to `$ npm i -s image-downloader mkdirp` first!
    * `$ node snek.js` to boop

# Notice
* Please configure `auth.json`. Get its template from `auth.example.json`.
  * Basically: `database`, `hostAddress`, and `apiURL`
  * Optional (deprecated): `hookID`, and `hookToken`

# Dependencies
* [express/body-parser/compression homepage](https://github.com/expressjs)
* [pug homepage](https://github.com/pugjs/pug)
* [sqlite homepage](https://github.com/mapbox/node-sqlite3)
* [canvas homepage](https://github.com/Automattic/node-canvas/wiki)
* [minor: discord.js](https://github.com/hydrabolt/discord.js)