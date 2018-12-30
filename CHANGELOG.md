# 2.1.0
On commit: `f55be4e`
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
