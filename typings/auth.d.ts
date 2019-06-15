/**
 * @property token The token to pass to the API
 * @property url The API endpoint
 */
export interface Api {
  token: string;
  url: string | 'http://localhost/api/';
}

/**
 * @property address The machine's external IP Address
 * @property port The port where the server should listen
 */
export interface Host {
  address: string;
  port: number;
}

/**
 * @property callback Path to redirect (rootURL/[callback path])
 * @property key Client ID
 * @property scope Scopes of authorization
 * @property secret Client Secret/Token
 */
export interface GrantProvider {
  callback: string;
  key: string;
  scope: string[];
  secret: string;
}

/**
 * @property channel The channel where to read announcement messages
 * @property dbReportChannel The channel where to send KamihimeDB reports
 * @property token The client token
 * @property wikiReportChannel The channel where to send Wiki reports
 */
export interface DiscordClient {
  channel: string;
  dbReportChannel: string;
  token: string;
  wikiReportChannel: string;
  donorID: string;
}

/**
 * @property gist The Github Gist ID.
 * @property token The Github user's personal access token.
 */
export interface Github {
  gist: string;
  token: string;
}

/**
 * @property session The user's Session value.
 * @property xsrf The user's XSRF Token value.
 */
export interface KamihimeGrant {
  session: string;
  xsrf: string;
}
