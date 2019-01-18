# 2.2.1
On commit: 00d95122e20dc38d8cd1082b5dce0f8294b124d1
  ## Fixes
  - `Fix`: (`Already fixed at 2.2.0`) `Player/scenario` `/legacy` image duplicates on repeating sequence
  - `Fix`: `CSP` breaks top-nav's `burger icon`
  - `Fix`: `Player/story` images has been centered to be friendlier on mobile
# 2.2.0
On commit: 0af8843f5f0477fa88366b788c1a49eff4b999fd
<br>More info (#7)
  ## Enhancements
  - `Change`: `API HTTP statuses` were tweaked
  - `Change`: `Info Table` background `darker colour`
  - `Change`: `Login redirect` behaves better
  - `Change`: `Player` borders for guide
  - `Change`: `Press OK to play` player control instructions
  - `Change`: `Top navigation` bar is now powered by `Bootstrap`
  - `Change`: `Views` rewritten
  - `Change`: `Website Status` sidebar => `Announcement` alert box
  - `Change`: Add `report` as anon/logged user on report
  - `Change`: favicon changed to `Amaterasu` from `Eros`
  - `Change`: Increased `visit limits`
  - `Change`: Increased ratelimit for `GET /list`
  - `Change`: Much better `Disclaimer`. Now provides `Privacy and Cookies policy`
  - `Change`: Removed `search textbox` on navigation sidebar
  - `Change`: sliced `GET /search` result length to `ten items`
  - `Change`:dev: Readme: Added `Pug Task`
  - `Feat`: `HTTPS` redirect
  - `Feat`: Global `Search textbox`
  - `Feat`: User auth middleware
  - `Feat`:dev: TSLint rule (`template-strings`)
  ## Fixes
  - `Fix`: *Unintended* `visit limits`
# 2.1.1
On commit: 5018e33c13ba53bd9300098c92e11796902ff98a
  ## Enhancements
  - `report`: Added more report titles on Wiki Info
  ## Fixes
  - `util/scenarios`: Get .blacklist from gist instead of from repo

# 2.1.0
On commit: f55be4e4201d5db19e2e79f4502a1821701efd9d
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
