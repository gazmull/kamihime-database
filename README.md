[![Build Status](https://travis-ci.org/gazmull/kamihime-database.svg?branch=master)](https://travis-ci.org/gazmull/kamihime-database)
# Kamihime Database
Website + REST (JSON) API for Kamihime Database
<br> Character statistics are provided by [Kamihime Project Fandom (Nutaku)](https://kamihime-project.fandom.com)

## Links
- [Site](https://kamihimedb.thegzm.space)
- [Support](http://support.thegzm.space)
- [API Documentation](https://docs.thegzm.space/kamihime-database)
- [Changelog](/CHANGELOG.md)
- [Util/Scenario `.blacklist`](https://gist.github.com/gazmull/45cd187e4a476795bcef630a8018e1a6)

## Requirements
- [NGINX (skip to NGINX section)](http://blog.danyll.com/setting-up-express-with-nginx-and-pm2/)
- [Node](https://nodejs.org) 12
- [MariaDB](https://mariadb.org) 10
- [Discord App + Bot Account](https://discordapp.com/developers/applications/me)
- [Github Personal Access Token](https://github.com/settings/tokens)
- [Build Tools (**Windows**)](https://github.com/felixrieseberg/windows-build-tools) | [Build Tools (**Linux**)](https://superuser.com/questions/352000/whats-a-good-way-to-install-build-essentials-all-common-useful-commands-on)

## Notice
- I do not guarantee 100% coverage of the project within this documentation. If there is really something needed to be added, see [Contributing](#Contributing).
- **NGINX Config**: Have this under your NGINX config (`/etc/nginx/sites-enabled/[your domain name]`): [Sample Template](https://gist.github.com/gazmull/85ea4cacc30647d8afc8ef910b2291a7). Texts wrapped with `[]` should be replaced.
- **App Config**: Please configure `auth.ts`. Get its template from `auth.example.ts`
    - It can be found at `src/auth` folder.
    - For generating episode resources, you need your Kamihime account's credentials (please use a dummy instead for safety) such as XSRF and Session tokens.
      - They can be found at browser cookies (`cf.[r/g].kamihimeproject.dmmgames.com` domain)
- **MariaDB**: Import database schema to your created database (default: `kamihimedb`) with `utf8_unicode_ci` collation.
    - The `db.zip` file will not be updated for every new character release. It only serves as a starting kit for running the website.
- **Util/Scenario**: If you found non-existent files that causes error on any story/scenario, please report [here](https://gist.github.com/gazmull/45cd187e4a476795bcef630a8018e1a6).
    - Once the reported files are added, you may do `$ yarn scenarios-v` again. See [Procedures-3](#Procedures) for more info.
- **Package Manager**: [Yarn](https://yarnpkg.com/en/docs/getting-started) is recommended.

## Procedures
1. Read [Requirements](#Requirements) and [Notice](#Notice).
2. Run `$ yarn`
    - You have to build the src too: `$ yarn --production=false`
3. Run `$ yarn scenarios` to generate episode resources.
    - Or `$ yarn scenarios-v` to run with verbose logging.
    - Append `-l#` or `--latest=#` to generate episode resources based on the number provided (e.g: 5 is for 5 characters). `#` is for a number.
        - This is not compatible with `--id`.
        - e.g: `-l5` or `--latest=5`
    - Append `-i{{id}}` or `--id={{id}}` to generate episode resources based on the character provided. `{{id}}` is for a character ID.
        - This is not compatible with `--latest`.
        - e.g.: `-ik0001` or `--id=k0001`
    - Append `--eidolon` / `--soul` / `--ssr+` / `--ssr` / `--sr` / `--r` (rarity options are for `kamihime`) to generate episode resources strictly in the character type specified.
        - This is compatible with `--latest` but **not** with `--id`.
4. Run `$ npx gulp`
5. Run `$ node .`
    - `$ yarn pm2` for PM2 preference / production stage.

## Contributing
- Looking for feedbacks, so feel free to file an issue or a pull request!
- For code-related:
    - Fork this repository, clone to your machine, and follow the project's development configuration [e.g. TSLint]
        - `$ yarn --production=false` to install.
    - Compilation:
      - `$ yarn dev:watch` for compile-and-serve process.
    - Run `$ yarn test` to verify if your build is passing.
        - Failing build will be rejected at default.

## License
> [**MIT**](/LICENSE)

© 2018-present [Euni](https://github.com/gazmull) (gazmull)
