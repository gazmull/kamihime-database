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
 * @property port The port where the serve should listen
 */
export interface Host {
  address: string;
  port: number;
}

/**
 * @property id The Discord channel ID
 * @property token The Discord channel's webhook token
 */
export interface WebHook {
  id: string;
  token: string;
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
