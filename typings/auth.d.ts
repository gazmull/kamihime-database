/**
 * @property url The API endpoint
 * @property token The token to pass to the API
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

export interface GrantDefaults {
  host: 'localhost:80';
  protocol: 'http' | 'https';
  state?: boolean;
}

export interface GrantProvider {
  callback: string;
  key: string;
  secret: string;
  scope: string[];
}
