/**
 * @property url The API endpoint
 * @property token The token to pass to the API
 */
export interface Api {
  token: string;
  url: string | 'http://localhost/api/';
}

/**
 * @property id The Discord channel ID
 * @property token The Discord channel's webhook token
 */
export interface WebHook {
  id: string;
  token: string;
}
