[![Build Status](https://travis-ci.org/gazmull/kamihime-database.svg?branch=master-gentle)](https://travis-ci.org/gazmull/kamihime-database)
# Kamihime Database
> `master-gentle` branch: Branch that will be submitted as my [webdev](https://github.com/gazmull/webdev) final exam. This is also the superior version of `master` branch at the moment.

Website + REST (JSON) API for Kamihime Database
<br> Written in TypeScript, transpiled to Uglified CommonJS (NodeJS)

- [Eros Dev](http://erosdev.thegzm.space)
- [Eros Support](http://support.thegzm.space)
- [Add Eros Instead?](http://addbot.thegzm.space)
- [Browse Harem Scenes](http://kamihimedb.thegzm.space)

## <u>**Implementation**</u> Phase Warning
> This is currently a non-testing-work-in-progress branch. It may work, but there are missing [planned] features.
  <br> If you found something that can be contributed to the code, please don't hesitate to slam that PR/Issue button!

## Requirements
- [Node](https://nodejs.org) 10 and above
- [Webhook](https://support.discordapp.com/hc/en-us/articles/228383668); See [Notice](#Notice) for config setup

## Notice
- Please configure `auth.ts`. Get its template from `auth.example.ts`.
  - Can be found at `src/auth` folder
  - Basically: `database`, `hostAddress`, `rootURL`, `api.url`, `hook.id`, and `hook.token`

## Testing / Production Procedures
1. Read [Requirements](#Requirements) and [Notice](#Notice)
2. Execute `$ npm install` or `$ yarn`
    - You have to build the src too: `$ npm install --only=dev` or `$ yarn --production=false`
3. Execute `$ npm run serve`
  <br> `$ npm run pm2-serve` for PM2 preference / production stage

## Contributing
- Looking for feedbacks, so feel free to file an issue or a pull request!
- For code-related:
  - Fork this repository, clone to your machine, and follow the project's development configuration [e.g. TSLint]
    - `npm install --only=dev` or `yarn --production=false` to install
  - Run `npm test` or `yarn test` to verify if your build is passing
    - Failing build will be rejected at default

## License
  MIT
