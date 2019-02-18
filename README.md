[![Build Status](https://travis-ci.org/gazmull/kamihime-database.svg?branch=master)](https://travis-ci.org/gazmull/kamihime-database)
# Kamihime Database
Website + REST (JSON) API for Kamihime Database
<br> Character statistics are provided by [Kamihime Project Wikia (Nutaku)](https://kamihime-project.wikia.com)

## Links
- [Site](https://kamihimedb.thegzm.space)
- [Support](http://support.thegzm.space)
- [API Documentation](https://gazmull.github.io/kamihime-database)
- [Changelog](/CHANGELOG.md)
- [Util/Scenario `.blacklist`](https://gist.github.com/gazmull/45cd187e4a476795bcef630a8018e1a6)

## Recommendations
- VS Code Extensions
    1. **[Live Sass Compiler](https://marketplace.visualstudio.com/items?itemName=ritwickdey.live-sass)** For watching saved Sass files and applying vendor prefixes on compilation.

## Requirements
- [nginx (skip to nginx section)](http://blog.danyll.com/setting-up-express-with-nginx-and-pm2/)
- [Node](https://nodejs.org) 10 or 11
- [MariaDB](https://mariadb.org) 10
- [Discord App + Bot Account](https://discordapp.com/developers/applications/me)
- [Github Personal Access Token](https://github.com/settings/tokens)
- [Build Tools (**Windows**)](https://github.com/felixrieseberg/windows-build-tools) | [Build Tools (**Linux**)](https://superuser.com/questions/352000/whats-a-good-way-to-install-build-essentials-all-common-useful-commands-on)

## Notice
- I do not guarantee 100% coverage of the project within this documentation. If there is really something needed to be added, see [Contributing](#Contributing).
- **App Config**: Please configure `auth.ts`. Get its template from `auth.example.ts`
    - It can be found at `src/auth` folder.
- **MariaDB**: Import database schema to your created database (default: `kamihimedb`) with `utf8_unicode_ci` collation.
    - The `db.zip` file will not be updated for every new character release. It only serves as a starting kit for running the website.
- **Util/Scenario**: If you found non-existent files that causes error on any story/scenario, please report [here](https://gist.github.com/gazmull/45cd187e4a476795bcef630a8018e1a6).
    - Once the reported files are added, you may do `$ yarn run scenarios-v` again. See [Procedures-3](#Procedures) for more info.
- **Package Manager**: [Yarn](https://yarnpkg.com/en/docs/getting-started) is recommended.

## Procedures
1. Read [Requirements](#Requirements) and [Notice](#Notice).
2. Run `$ yarn`
    - You have to build the src too: `$ yarn --production=false`
3. Run `$ yarn run scenarios` to generate episode resources.
    - Or `$ yarn run scenarios-v` to run with verbose logging.
    - Append `-l#` or `--latest=#` to generate episode resources based on the number provided (e.g: 5 is for 5 characters). `#` is for a number.
        - This is not compatible with `--id`.
        - e.g: `-l5` or `--latest=5`
    - Append `-i{{id}}` or `--id={{id}}` to generate episode resources based on the character provided. `{{id}}` is for a character ID.
        - This is not compatible with `--latest`.
        - e.g.: `-ik0001` or `--id=k0001`
    - Append `--eidolon` / `--soul` / `--ssr+` / `--ssr` / `--sr` / `--r` (rarity options are for `kamihime`) to generate episode resources strictly in the character type specified.
        - This is compatible with `--latest` but **not** with `--id`.
4. Run `$ yarn run build`
5. Run `$ node .`
    - `$ yarn run pm2` for PM2 preference / production stage.

## Contributing
- Looking for feedbacks, so feel free to file an issue or a pull request!
- For code-related:
    - Fork this repository, clone to your machine, and follow the project's development configuration [e.g. TSLint]
        - `$ yarn --production=false` to install.
    - For `src/views`-related, you may use the task `Move PUG Files` to easily copy the new changes from `src` to `build`.
        - This only works with VSCode. However for CLI you may run this: `$ yarn run finalize --pug`
    - For Sass compilation, see [VS Code Extensions-1](#Recommendations)
    - Run `$ yarn run build` to verify if your build is passing.
        - Failing build will be rejected at default.

## License
MIT
