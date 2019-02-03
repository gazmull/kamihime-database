# 2.5.0
  On commit: 7fde04e1b387b26685b3c622bbaa84d49cfa1424
  ## Overview
  This update implements new features and bug fixes mostly on backend API such as `util/scenarios`, `dashboard`, and `discord client`. A footer has also been added for frontend to track application version and provide the discord link (contact).
  ## Enhancements
  - `util/scenarios`: Added extract by character type option
  - `discord client`: Added listener for `error` and `messageUpdate`
  - `views template`: Added footer links
  ## Changes
  - `auth-handler`: Reverted XHR requests being ignored
  - `dashboard`: String values don't require quotes anymore
  ## Fixes
  - `browser`: Fixed query selector breaking, causing the side-nav to stop highlighting current category
  - `dashboard`: Fixed a bug where character ID isn't consistently passed, which is required by KamihimeDB API
  - `dashboard`: Fixed a bug where apostrophes inside update values are being stripped off
# 2.4.2
  On commit: e662ed88a970a960c3e44842ff4772ee52f9c339
  ## Fixes
  - `auth-handler`: Fixed user settings is being updated to all users.
# 2.4.1
  On commit: 5bdbe2a0ea0b8a31c6f8292a63d6a8bfd9ba5d72
  ## Overview
  This updated implements follow-up fix for duplicate search results caused by unhandled asynchronous behaviour.
  > Warning: Please be advised this may not work with browsers marked as red here: [Can I use#abortcontroller](https://caniuse.com/#feat=abortcontroller)
  ## Fixes
  - `search`: Added `AbortController API` to handle asynchronous behaviour of search request which causes duplicate search results.
# 2.4.0
  On commit: cb187df7bf9ecfbdc582a66c8419d3fa6925e69e
  ## Overview
  This update implements refactorisation of cookie system, and removal of the 'jumpy' effect when searching with a desktop browser.
  ## Changes
  - `search`: Removed the 'jumpy' effect it leaves when being closed; trading off window responsiveness (changing window size) while searching
  ## Enhancements
  - `cookies`: Refactored, user settings is now distributed under one cookie only
  - `og:*`: `og:image` added
# 2.3.1
  On commit: 495fa63883efa120ef765db900fd46967ec66712
  ## Overview
  This update implements security enhancement for users, and clarity of the agreement buttons at `/disclaimer`.
  <br><br>
  For developers, dashboard prompts has been enhanced.
  ## Enhancements
  - `cookies`: Tighter security (added secured and signed flags)
  - `disclaimer`: Agreement buttons should be easier to see now with background addition
  - `admin`: Enhanced action prompts
# 2.3.0
On commit: 4ecce3179b9422550a19f23e916c4a58cda960a6
<br>More info (#10)
  ## Overview
  This update implements site `user interface and user experience optimisation` such as simpler `component animations` and overall `layout and colour scheme`.
  <br><br>
  For developers, `admin dashboard`, `deprecation` notice on `update/redirect route`, and `codebase re-organisation` such as moving from `local lib to remote lib`, and migrated from `CSS to Sass` has been implemented.
  ## Enhancements
  - `views side-nav`: Help text emphasised
  - `admin`: Implmented route (#1)
  - `views meta-tags`: Added og:image+title
  - `auth handler`: Simpler process
  - `player/scenario`: Renderer changed to `transform` animation for optimal `performance`
  - `views layout`: Animations and colour scheme `optimised`; mobile friendlier
  - `changelog`: Re-organised

  ## Changes
  - `db`: Modified admin table for password
  - `lib`: Local to remote (`jsdelivr`) (#9)
  - `static`: Re-organised static files (`JS/CSS`)
  - `views styles`: `CSS to SCSS`; Modularised
  - `views vendors`: Separated scripts and styles
  - `update/redirect routes`: Added deprecation notice
  - `views`: Refactored templates and `style`

  ## Fixes
  - `util/scenario`: Add fix for extracting scripts
# 2.2.1
On commit: 00d95122e20dc38d8cd1082b5dce0f8294b124d1
  ## Fixes
  - (`already fixed at 2.2.0`): `Player/scenario` `/legacy` image duplicates on repeating sequence
  - `csp`: Fixed broken top-nav's `burger icon`
  - `player/story`: Images has been centered to be friendlier on mobile
# 2.2.0
On commit: 0af8843f5f0477fa88366b788c1a49eff4b999fd
<br>More info (#7)
  ## Overview
  This update implements 
  ## Enhancements
  - `api http statuses`: Tweaked for better error catching
  - `info table`: Background `darker colour`
  - `login redirect`: Behaves better
  - `player`: Borders for guide
  - `press OK to play`: Player control instructions
  - `top navigation`: Bar is now powered by `Bootstrap`
  - `views`: Rewritten
  - `website Status` sidebar: => `Announcement` alert box
  - `report`: Added prompt report as anon/logged user on report
  - `favicon`: Changed to `Amaterasu` from `Eros`
  - `visit limits`: Increased from 3 visits to (anon: 5 | logged in: 10) visits
  - `ratelimit for GET /list`: Increased from 1 to 2
  - `disclaimer`: Now provides `Privacy and Cookies policy`
  - `search textbox`: Removed on navigation sidebar
  - `GET /search`: Sliced result length to `ten items`
  - `readme`: Added `Pug Task`
  - `https`: Supported
  - `search textbox`: Now global functional
  - `User auth middleware`: Implemented
  - tslint rule (`template-strings`): Added
  ## Fixes
  - *Unintended* `visit limits`: Fixed
# 2.1.1
On commit: 5018e33c13ba53bd9300098c92e11796902ff98a
  ## Enhancements
  - `report`: Added more report titles on Wiki Info
  ## Fixes
  - `util/scenarios`: Get .blacklist from gist instead of from repo

# 2.1.0
On commit: f55be4e4201d5db19e2e79f4502a1821701efd9d
  ## Overview
  This update implements player visual settings, API documentation, and site & backend util bug fixes.
  ## Enhancements
  - `api`: Added documentation.
  - `database`: Added `db.sql` as starter schema.
  - `player`: Added visual settings.
  - `status`: Added ability to parse links within the status message.
  - `util/scenarios`: Added user-friendly options on script command. See [Procedures #3](/README.md#testing--production-procedures).
  ## Fixes
  - `api`: Fixed `PUT /update` missing session check.
  - `browser`: View counts from `Top 10` is now formatted.
  - `disclaimer`: Fixed redirection after confirmation.
  - `help`: Reworded help texts.
  - `info`: Fixed incorrect Report icon.
  - `player`: Fixed where going *previous* will repeat the character talk (`scenario`-type player).
  - `tooltips`: Fixed an issue where the tooltip does not disappear after closing modals.
  - `util/scenarios`: Actually make use of `.blacklist` to filter out non-existent files which causes player asset loading error.
