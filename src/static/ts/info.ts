async function confirmLogin (id: string) {
  const res = await sweet({
    cancelButtonText: 'No, thanks',
    confirmButtonText: 'Yes, please',
    html: [
      'There is no way to contact you if this needs to contact you back.',
      'Do you want to log in before reporting?',
    ].join('<br><br>'),
    showCancelButton: true,
    titleText: 'Reporting as Anonymous User',
    type: 'warning',
  })

  if (res.value)
    return location.replace('/login');
  else if (res.dismiss === sweet.DismissReason.cancel)
    return showReport(id);
}

async function showReport (id: string) {

  // tslint:disable:object-literal-sort-keys
  const types = {
    title: 'Wrong episode title',
    resource: 'Wrong episode story/scenario',
    internal: 'Cannot view story/scenario',
    others: 'Others',
  };
  // tslint:enable:object-literal-sort-keys

  const postBody = {
    characterId: id,
    message: {
      content: null as string,
      subject: null as string,
    } // tslint:disable-line:trailing-comma
  };

  try {
    const res = await sweet
      .mixin({
        allowOutsideClick: () => !sweet.isLoading(),
        progressSteps: [ '1', '2' ],
        showCancelButton: true,
        titleText: 'Reporting Errors...',
      })
      .queue([
        {
          input: 'select',
          inputOptions: types,
          inputPlaceholder: 'Select an issue...',
          inputValidator: value => {
            return new Promise(resolve => {
              if (!value) resolve('Please select an issue.');

              postBody.message.subject = value;
              resolve();
            });
          },
          text: 'What is the concern of this report?',
        },
        {
          html: [
            '(Optional) To help us resolve the issue quicker, please describe the issue.',
            'Links are welcome.',
          ].join('<br>'),
          input: 'textarea',
          inputPlaceholder: 'Further specify the issue...',
          preConfirm: async content => {
            try {
              postBody.message.content = content;

              const res = await fetch('/api/report', {
                body: JSON.stringify(postBody),
                credentials: 'include',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                method: 'POST',
              });
              const json = await res.json();

              if (json.error) throw json.error.message;

              return true;
            } catch (err) { sweet.showValidationMessage('Report failed: ' + err); }
          },
          showLoaderOnConfirm: true,
        },
      ])

    if (!res.value || !res.value.length) return;

    return sweet({
      text: 'Now then, we will have to wait...',
      title: 'Report submitted',
      type: 'success',
    });
  } catch(err) {
    return sweet({
      titleText: err.message,
      type: 'error',
    })
  }
}
