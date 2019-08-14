define({
  "name": "Kamihime Database API",
  "version": "2.3.0",
  "description": "Documentation for Kamihime Database API",
  "title": "Kamihime Database - API Documentation",
  "url": "https://kamihimedb.winspace/api",
  "header": {
    "title": "Guide",
    "content": "<h1>Guide</h1>\n<h2>Requests</h2>\n<blockquote>\n<p>If you are requesting with <code>XHR</code>, then you may skip this section.</p>\n</blockquote>\n<p>Your request headers must at least contain:</p>\n<table>\n<thead>\n<tr>\n<th style=\"text-align:center\">Name</th>\n<th>Value</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td style=\"text-align:center\">Accept</td>\n<td><code>application/json</code></td>\n</tr>\n<tr>\n<td style=\"text-align:center\">Content-Type</td>\n<td><code>application/json</code>, <code>application/x-www-form-urlencoded</code></td>\n</tr>\n</tbody>\n</table>\n<p>All requests must be sent to <a href=\"https://kamihimedb.winspace/api\"><strong>https</strong>://kamihimedb.winspace/api</a></p>\n<h2>Responses</h2>\n<p>All responses contain HTTP status code for partial check.</p>\n<h3>Rate Limit Headers</h3>\n<p><code>X-RateLimit-*</code> headers are composed of:</p>\n<table>\n<thead>\n<tr>\n<th style=\"text-align:center\">Header Name</th>\n<th>Description</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td style=\"text-align:center\">X-RateLimit-Limit</td>\n<td>Maximum of request before reset</td>\n</tr>\n<tr>\n<td style=\"text-align:center\">X-RateLimit-Remaining</td>\n<td>Remaining requests before reset</td>\n</tr>\n<tr>\n<td style=\"text-align:center\">X-RateLimit-Reset</td>\n<td>Time when the rate limit reset occurs in milliseconds</td>\n</tr>\n</tbody>\n</table>\n<h3>Success</h3>\n<p>Response body immediately returns the requested data object:</p>\n<pre><code class=\"language-json\">{\n  &quot;id&quot;: &quot;k0001&quot;,\n  &quot;name&quot;: &quot;Satan&quot;\n}\n</code></pre>\n<h3>Error</h3>\n<p>Response body returns an error object when an error has occurred:</p>\n<pre><code class=\"language-json\">{\n  &quot;error&quot;: {\n    &quot;message&quot;: &quot;Blah BLAAAAAAAAAAAAAARGHh&quot;,\n    &quot;code&quot;: 500\n  }\n}\n</code></pre>\n"
  },
  "template": {
    "withCompare": false
  },
  "sampleUrl": false,
  "defaultVersion": "0.0.0",
  "apidoc": "0.3.0",
  "generator": {
    "name": "apidoc",
    "time": "2019-08-14T09:38:52.695Z",
    "url": "http://apidocjs.com",
    "version": "0.17.7"
  }
});
