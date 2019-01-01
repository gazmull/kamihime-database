[![Build Status](https://travis-ci.org/gazmull/kamihime-database.svg?branch=master)](https://travis-ci.org/gazmull/kamihime-database)
# Kamihime Database
Website + REST (JSON) API for Kamihime Database
<br> Written in TypeScript, transpiled to Uglified CommonJS (NodeJS)
<br> Character statistics are provided by [Kamihime Project Wikia (Nutaku)](https://kamihime-project.wikia.com)

## Links
- [Site](http://kamihimedb.thegzm.space)
- [Support](http://support.thegzm.space)
- [API Documentation](https://gazmull.github.io/kamihime-database)
- [Changelog](/CHANGELOG.md)
- [Scenario-Util / Blacklist](https://gist.github.com/gazmull/45cd187e4a476795bcef630a8018e1a6)

## Requirements
- **Debian-based OS only**: [authbind](https://sites.google.com/site/mytechnicalcollection/utility/authbind)
- [Node](https://nodejs.org) 10 or 11
- [MariaDB](https://mariadb.org) 10
- [Discord App + Bot Account](https://discordapp.com/developers/applications/me)
- [Github Personal Access Token](https://github.com/settings/tokens)

## Notice
- I do not guarantee 100% coverage of the project within this documentation. If there is really something needed to be added, see [Contributing](#Contributing).
- Please configure `auth.ts`. Get its template from `auth.example.ts`.
  - It can be found at `src/auth` folder.
- The `db.sql` file will not be updated for every new character release. It only serves as a starting kit for running the website.
- If you found non-existent files that causes error on any story/scenario, please report [here](https://gist.github.com/gazmull/45cd187e4a476795bcef630a8018e1a6).
- [Yarn](https://yarnpkg.com/en/docs/getting-started) is recommended.

## Testing / Production Procedures
1. Read [Requirements](#Requirements) and [Notice](#Notice)
2. Execute `$ yarn` (Before this, make sure you have [**Build Tools** (**Windows**)](https://github.com/felixrieseberg/windows-build-tools) | [**Build Tools** (**Linux**)](https://superuser.com/questions/352000/whats-a-good-way-to-install-build-essentials-all-common-useful-commands-on))
    - You have to build the src too: `$ yarn --production=false`
3. Execute `$ yarn run scenarios` to generate episode resources
    - Or `$ yarn run scenarios-v` to run with verbose logging
    - Append `-l#` or `--latest=#` to generate episode resources based on the number provided (e.g: 5 is for 5 characters). `#` is for a number.
        - This is not compatible with `--id`.
        - e.g: `-l5` or `--latest=5`
    - Append `-i{{id}}` or `--id={{id}}` to generate episode resources based on the character provided. `{{id}}` is for a character ID.
        - This is not compatible with `--latest`.
        - e.g.: `-ik0001` or `--id=k0001`
4. Execute `$ yarn run build`
5. Execute `$ node .`
    - `$ yarn run pm2-serve` for PM2 preference / production stage
    - `$ yarn run pm2-serve-bind` for Debian-based server. [`authbind`](#Requirements) must be installed.

## Contributing
- Looking for feedbacks, so feel free to file an issue or a pull request!
- For code-related:
  - Fork this repository, clone to your machine, and follow the project's development configuration [e.g. TSLint]
    - `yarn --production=false` to install
  - Run `yarn run build` to verify if your build is passing
    - Failing build will be rejected at default

## License
MIT
