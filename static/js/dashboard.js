const fields = [
  'id',
  'name',
  'rarity',
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

async function promptID (action) {
  if (!action)
    sweet({ titleText: 'Invalid action.', type: 'error' });

  try {
    let character;

    if (action !== 'add') {
      const { value, dismiss } = await sweet({
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
    }

    let response;

    switch (action) {
      default: response = submit(action, `id=${character.id}`); break;
      case 'add':
        response = await sweet({
          html: 'Add an entry with: [key]=[value]; each separated by newline (\\n).',
          input: 'textarea',
          inputValue: fields.map(el => `${el}=`).join('\n'),
          width: 1024,
        })
          .then(res => {
            if (res.dimiss) return;

            return res.value;
          });

        if (!response) return;

        response = submit(action, response);
        break;
      case 'update':
        response = await sweet({
          input: 'textarea',
          inputValue: unclean(character),
          text: 'Each entry should be separated by newline',
          width: 1024,
        })
          .then(res => {
            if (res.dimiss) return;

            return res.value;
          });

        if (!response) return;

        response = submit(action, response, character.id);
        break;
    }

    response = await response;

    if (response)
      sweet({
        text: `${action}: ${character.name} (${character.id})`,
        titleText: 'Operation Successfull',
        type: 'success',
      });
  } catch (err) { sweet({ text: err, type: 'error' }); }
}

async function submit (action, value = '', id) {
  let method;

  switch (action) {
    default: method = 'PUT'; break;
    case 'add': method = 'POST'; break;
    case 'delete': method = 'DELETE'; break;
  }

  const data = clean(value);

  if (!data.id) Object.assign(data, { id: id }); // tslint:disable-line:object-literal-shorthand

  const confirm = await sweet({
    cancelButtonText: 'No',
    confirmButtonText: 'Yes',
    showCancelButton: true,
    text: 'Are you sure about this action?',
    titleText: `Destructive Action: ${action} (${data.id || id})`,
    type: 'warning',
  })
    .then(res => res.dismiss ? false : true);

  if (!confirm) return;

  const options = {
    body: JSON.stringify(data),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: method, // tslint:disable-line:object-literal-shorthand
  };
  const response = await fetch(`/api/${action}`, options);
  const json = await response.json();

  if (json.error) throw json.error.message;

  return true;
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
    _val = isNaN(_val) ?  _val : parseInt(_val);

    Object.assign(result, { [key]: _val });
  }

  return result;
}

function unclean (obj = {}) {
  const result = [];

  for (const key of updateFields) {
    const value = obj[key];

    result.push(`${key}=${value}`);
  }

  return result.join('\n');
}
