export interface Api {
  token: string;
  url: string | 'http://localhost/api/';
}

export interface WebHook {
  id: string;
  token: string;
}
