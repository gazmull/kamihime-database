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

## Requirements
- [Node](https://nodejs.org) 10 or 11
- [MariaDB](https://mariadb.org) 10
- [Discord App + Bot Account](https://discordapp.com/developers/applications/me)

## Notice
- I do not guarantee 100% coverage of the project within this documentation. If there is really something needed to be added, see [Contributing](#Contributing)
- Please configure `auth.ts`. Get its template from `auth.example.ts`.
  - Can be found at `src/auth` folder
- The `db.sql` file will not be updated for every new character release. It only serves as a starting kit for running the website.

## Testing / Production Procedures
1. Read [Requirements](#Requirements) and [Notice](#Notice)
2. Execute `$ npm install` or `$ yarn` (Before this, make sure you have [**Build Tools** (**Windows**)](https://github.com/felixrieseberg/windows-build-tools) | [**Build Tools** (**Linux**)](https://superuser.com/questions/352000/whats-a-good-way-to-install-build-essentials-all-common-useful-commands-on))
    - You have to build the src too: `$ npm install --only=dev` or `$ yarn --production=false`
3. Run `$ npm run scenarios` to generate episode resources
    - Or `$ npm run scenarios-v` to run with verbose logging
    - Append `-l#` or `--latest=#` to generate episode resources based on the number provided (e.g: 5 is for 5 characters). `#` is for a number.
        - This is not compatible with `--id`.
        - e.g: `-l5` or `--latest=5`
    - Append `-i{{id}}` or `--id={{id}}` to generate episode resources based on the character provided. `{{id}}` is for a character ID.
        - This is not compatible with `--latest`.
        - e.g.: `-ik0001` or `--id=k0001`
4. Execute `$ npm run serve`
    - `$ npm run pm2-serve` for PM2 preference / production stage

## Contributing
- Looking for feedbacks, so feel free to file an issue or a pull request!
- For code-related:
  - Fork this repository, clone to your machine, and follow the project's development configuration [e.g. TSLint]
    - `npm install --only=dev` or `yarn --production=false` to install
  - Run `npm run build` or `yarn run build` to verify if your build is passing
    - Failing build will be rejected at default

## License
MIT
