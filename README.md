[![Build Status](https://travis-ci.org/gazmull/kamihime-database.svg?branch=master-gentle)](https://travis-ci.org/gazmull/kamihime-database)
# Kamihime Database
> `master-gentle` branch: Branch that will be submitted as my [webdev](https://github.com/gazmull/webdev) final exam. This is also the superior version of `master` branch at the moment.

Website + REST (JSON) API for Kamihime Database
<br> Written in TypeScript, transpiled to Uglified CommonJS (NodeJS)
<br> Character statistics are provided by [Kamihime Project Wikia (Nutaku)](https://kamihime-project.wikia.com)

- [Site](http://kamihimedb.thegzm.space)
- [Support](http://support.thegzm.space)

## <u>**Implementation**</u> Phase Warning
> It may work, but there are missing [planned] features.
  <br> If you found something that can be contributed to the code, please don't hesitate to slam that PR/Issue button!

## Requirements
- [Node](https://nodejs.org) 10 and above
- [Discord App+Bot Account](https://discordapp.com/developers/applications/me)
- Straining your brain. I do not guarantee 100% coverage of the project within this documentation.

## Notice
- Please configure `auth.ts`. Get its template from `auth.example.ts`.
  - Can be found at `src/auth` folder
- The `db.sql` file will not be updated for every new character release. It only serves as a starting kit for running the website.

## Testing / Production Procedures
1. Read [Requirements](#Requirements) and [Notice](#Notice)
2. Execute `$ npm install` or `$ yarn` (Before this, make sure you have [**Build Tools** (**Windows**)](https://github.com/felixrieseberg/windows-build-tools) | [**Build Tools** (**Linux**)](https://superuser.com/questions/352000/whats-a-good-way-to-install-build-essentials-all-common-useful-commands-on))
    - You have to build the src too: `$ npm install --only=dev` or `$ yarn --production=false`
3. Run `$ npm run scenarios` to generate episode resources
    - Or `$ npm run scenarios-v` to run with verbose logging
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
