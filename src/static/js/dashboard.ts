const fields = [
  'id',
  'name',
  'rarity',
  'tier',
  'harem1Title',
  'harem1Resource1',
  'harem2Title',
  'harem2Resource1',
  'harem2Resource2',
  'harem3Title',
  'harem3Resource1',
  'harem3Resource2',
];
const updateFields = fields.filter(el => el !== 'id');

async function promptID (action: APIAction) {
  if (!action)
    sweet.fire({ titleText: 'Invalid action.', type: 'error' });

  try {
    let character: Character;

    if (![ 'add', 'hero', 'refresh' ].includes(action)) {
      try {
        const { value, dismiss } = await sweet.fire({
          allowOutsideClick: () => !sweet.isLoading(),
          confirmButtonText: 'Next',
          input: 'text',
          inputPlaceholder: 'Character ID',
          preConfirm: async id => {
            const _response = await fetch(`/api/id/${id.toLowerCase()}`, { headers: { Accept: 'application/json' } });
            const _json = await _response.json();
            if (_json.error) throw _json.error.message;

            return _json;
          },
          showLoaderOnConfirm: true,
          titleText: action.toUpperCase(),
        });

        if (dismiss) return;

        character = value;
      } catch (err) {
        sweet.fire('An Error Occurred', err, 'error');
      }
    }

    let response: string | (Character & { added: number }) | Promise<any>;

    switch (action) {
      default: response = submit(action, `id=${character.id}`); break;
      case 'refresh': response = submit(action); break;
      case 'add':
        response = await sweet.fire({
          html: 'Add an entry with: [key]=[value]; each separated by newline (\\n).',
          input: 'textarea',
          inputValue: fields.map(el => `${el}=`).join('\n'),
          width: 1024,
        })
          .then(res => {
            if (res.dismiss) return;

            return res.value;
          });

        if (!response) return;

        response = submit(action, response as string);
        break;
      case 'update':
      case 'hero':
        response = await sweet.fire({
          input: 'textarea',
          inputValue: action === 'update' ? unclean(character) : '',
          text: `Each entry should be separated by newline${action === 'hero' ? ' | Adding heroes syntax: "ID,comment/username"' : ''}`,
          width: 1024,
        })
          .then(res => {
            if (res.dismiss) return;

            return res.value;
          });

        if (!response) return;

        response = submit(action, response as string, action === 'update' ? character.id : undefined);
        break;
    }

    response = await response as APIResponse;

    if (response)
      sweet.fire({
        text: `${action}${response.id ? `: ${response.name} (${response.id})` : action === 'hero' ? `: ${response.added} heroes` : ''}`,
        titleText: 'Operation Successfull'
      });
  } catch (err) { sweet.fire({ text: err }); }
}

async function submit (action: APIAction, value = '', id?: string) {
  let method: string;

  switch (action) {
    default: method = 'PUT'; break;
    case 'add': method = 'POST'; break;
    case 'delete': method = 'DELETE'; break;
    case 'refresh': method = 'GET'; break;
  }

  let data: { heroes: string[] } | IKamihime;

  if (action !== 'refresh')
    data = action === 'hero' ? { heroes: value.split('\n') } : clean(value);
  if (data) {
    if (!(data as IKamihime).id) Object.assign(data, { id });

    const confirm = await sweet.fire({
      cancelButtonText: 'No',
      confirmButtonText: 'Yes',
      showCancelButton: true,
      text: 'Are you sure about this action?',
      titleText: `Destructive Action: ${action} (${(data as IKamihime).id || id || value.split('\n').length})`
    })
      .then(res => res.dismiss ? false : true);

    if (!confirm) return;
  }

  const options: RequestInit = {
    body: method === 'GET' ? undefined : JSON.stringify(data),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: method, // tslint:disable-line:object-literal-shorthand
  };
  const response = await fetch(`/api/${action}${action === 'update' ? '?manual=true' : ''}`, options);
  const json = await response.json();

  if (json.error) throw json.error.message;

  return json;
}

function clean (value = '') {
  const values = value.split('\n');
  const result = {};

  for (const val of values) {
    let [ key, _val ] = val.split(/(?:\s+)?=(?:\s+)?/);
    key = key.trim();

    try { if (JSON.parse(_val) === null) continue; }
    catch { } // tslint:disable-line:no-empty

    _val = _val.trim();
    const parsed = isNaN(Number(_val)) ?  _val : parseInt(_val);

    Object.assign(result, { [key]: parsed });
  }

  return result as IKamihime;
}

function unclean (obj: any = {}) {
  const result = [];

  for (const key of updateFields) {
    const value = obj[key];

    result.push(`${key}=${value}`);
  }

  return result.join('\n');
}
