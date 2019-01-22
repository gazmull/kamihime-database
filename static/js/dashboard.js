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
          const _response = await fetch(`/api/id/${id}`, { headers: { Accept: 'application/json' } });
          const _json = await _response.json();
          if (_json.error) throw _json.error.message;

          return _json;
        },
        showLoaderOnConfirm: true,
      });

      if (dismiss) return;

      character = value;
    }

    let response;

    switch (action) {
      default: response = submit(action, `id='${character.id}'`); break;
      case 'add':
        response = submit(action, await sweet({
          input: 'textarea',
          inputPlaceholder: 'e.g: [key]=[value], [key2]=[value2]',
          text: 'Add an entry with: [key]=[value]. If value is string, surround it with quotes.',
        })
          .then(res => {
            if (res.dimiss) return;

            return res.value;
          }),
        );
        break;
      case 'update':
        response = submit(action, await sweet({
          input: 'textarea',
          inputValue: unclean(character),
          text: 'If value is string, surround it with quotes.',
        })
          .then(res => {
            if (res.dimiss) return;

            return res.value;
          }),
        );
        break;
    }

    response = await response;

    if (response)
      sweet({ titleText: 'Operation Successfull', type: 'success' });
  } catch (err) { sweet({ text: err, type: 'error' }); }
}

async function submit (action, value = '') {
  let method;

  switch (action) {
    default: method = 'PUT'; break;
    case 'add': method = 'POST'; break;
    case 'delete': method = 'DELETE'; break;
  }

  const options = {
    body: JSON.stringify(clean(value)),
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
  const values = value.split(/,(?:\s+)?/g);
  const result = {};

  for (const val of values) {
    let [ key, _val ] = val.split('=');
    _val = /'|"/.test(_val) ? _val.replace(/'|"/g, '') : parseInt(_val);

    Object.assign(result, { [key]: _val });
  }

  return result;
}

function unclean (obj = {}) {
  const result = [];

  for (const key in obj) {
    if (!obj[key]) continue;

    const value = obj[key];

    result.push(`${key}=${typeof value === 'string' ? `'${value}'` : value}`);
  }

  return result.join(', ');
}
