[![Build Status](https://travis-ci.org/gazmull/kamihime-database.svg?branch=master)](https://travis-ci.org/gazmull/kamihime-database)

# <img src="static/og-image.png" width=64/> Kamihime Database
Website + REST (JSON) API for Kamihime Database
<br> Character statistics are provided by [Kamihime Project Fandom (Nutaku)](https://kamihime-project.fandom.com)

## 🔗 Links
- [Site](https://kamihimedb.win)
- [Support](http://support.thegzm.space)
- [API Documentation](https://docs.thegzm.space/kamihime-database)
- [Changelog](/CHANGELOG.md)

## 🔺 Requirements
- [NGINX (skip to NGINX section)](http://blog.danyll.com/setting-up-express-with-nginx-and-pm2/)
- [Node](https://nodejs.org) 12
- [MariaDB](https://mariadb.org) 10
- [Discord App + Bot Account](https://discordapp.com/developers/applications/me)
- [Build Tools (**Windows**)](https://github.com/felixrieseberg/windows-build-tools) | [Build Tools (**Linux**)](https://superuser.com/questions/352000/whats-a-good-way-to-install-build-essentials-all-common-useful-commands-on)

## ⚠ Notice
- I do not guarantee 100% coverage of the project within this documentation. If there is really something needed to be added, see [Contributing](#Contributing).
- **NGINX Config**: Have this under your NGINX site config (`/etc/nginx/sites-available/[your domain name]`): [Sample Template](https://gist.github.com/gazmull/85ea4cacc30647d8afc8ef910b2291a7). Texts wrapped with `[]` should be replaced.
- **App Config**: Please configure `auth.js`. Get its template from `auth.example.js`
- **MariaDB**: Import database schema to your created database (default: `kamihimedb`) with `utf8_unicode_ci` collation.
    - The `db.zip` file will not be updated for every new character release. It only serves as a starting kit for running the website.
- **Package Manager**: [Yarn](https://yarnpkg.com/en/docs/getting-started) is recommended.

## 📜 Procedures
> `$` denotes it should be executed within your CLI.
1. Read [Requirements](#Requirements) and [Notice](#Notice).
2. `$ yarn`
    - You have to build the src too: `$ yarn --production=false`
3. `$ yarn test`
4. `$ node .`
    - `$ yarn pm2` for PM2 preference / production usage.

## 💡🐛💻 Contributing
- Looking for feedbacks, so feel free to file an issue or a pull request!
- For code-related:
    - Fork this repository, clone to your machine, and follow the project's development configuration [e.g. TSLint]
        - `$ yarn --production=false` to install.
    - Compilation:
      - `$ yarn dev:watch` for compile-and-serve process.
    - Run `$ yarn test` to verify if your build is passing.
        - Failing build will be rejected at default.

## 📒 License
> [**MIT**](/LICENSE)

© 2018-present [Euni](https://github.com/gazmull) (gazmull)
