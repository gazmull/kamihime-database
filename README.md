## As of 18/12/2017, This project's method of parsing image from Nutaku server is deprecated. [Here is probably why](https://i.imgur.com/HlEQFwI.png)

## 18/12/2017: Image retrieval for the Player has been re-routed to self-host
---
# Kamihime Database

Webserver version of Eros' Kamihime Database function (?UPD / ?PEEK)

* [Eros Dev](http://erosdev.thegzm.space)
* [Eros Support](http://support.thegzm.space)
* [Add Eros Instead?](http://addbot.thegzm.space)

# Requirements
* [Scenario Files from 'snek'](https://bitbucket.org/gazmull/snek)
  * Move the generated folders (`snek/static`) to this repository's static
    * Example: `$ mv snek/static/scenarios kamihime-database/static/`
  * Or move `snek`'s `index.js` to this repository and rename it as `snek.js`
    * Make sure to `npm i -s image-downloader mkdirp` first!
    * `node snek.js` to boop