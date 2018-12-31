import fetch from 'node-fetch';
import { github } from '../../../auth/auth';

export default async function GithubGist () {
  try {
    const response = await fetch('https://api.github.com/gists/' + github.gist, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: 'token ' + github.token,
      },
      method: 'GET',
    });

    if (!response.ok) throw null;

    const json = await response.json();
    const files: any = Object.values(json.files);
    const file = files.find(el => el.filename === '.blacklist');

    if (!file) throw null;

    let list: string[] = null;

    if (file.truncated) {
      const _response = await fetch(file.raw_url);

      if (!_response.ok) throw null;

      const _body = await response.text();

      list = _body.split('\n');
    } else list = file.content.split('\n');

    return list;
  } catch (err) {
    if (err && err.stack) throw err;

    return [];
  }
}
