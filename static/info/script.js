$(() => {
  if (!(Cookies.get('info-lastNav'))) {
    Cookies.set('info-lastNav', '#info');
    Cookies.set('menu', 'true');
  }

  if (Cookies.get('menu') === 'false') {
    $('#nav').addClass('nav-hidden');
    $('.nav-switch').removeClass('nav-switch-hide');
  }

  $('.collapse')
    .on('show.bs.collapse', () => $('.collapse.show').collapse('hide'))
    .on('shown.bs.collapse', () => {
      const currentPage = $(`.collapse.show`).attr('id');

      Cookies.set('info-lastNav', '#' + currentPage);

      $('.content.show .content-wrapper').attr('class', 'content-wrapper visible-browser');
      $(`.nav-link[data-target='${Cookies.get('info-lastNav')}']`).addClass('active');
    })
    .on('hide.bs.collapse', () => {
      $('.content-wrapper.visible-browser').attr('class', 'content-wrapper hidden-browser');
      $(`.nav-link.active`).removeClass('active');
    });

  $(Cookies.get('info-lastNav')).collapse('show');
});

function showReport (id, type = 0) {

  // tslint:disable:object-literal-sort-keys
  const types = [
    {
      stats: 'Wrong stats',
      info: 'Wrong brief info (first table)',
      ability: 'Wrong abilities',
      notes: 'Needs additional/wrong notes',
      image: 'Image issues',
      internal: 'Info cannot be resolved',
      others: 'Others',
    },
    {
      title: 'Wrong episode title',
      resource: 'Wrong episode story/scenario',
      internal: 'Cannot view story/scenario',
      others: 'Others',
    },
  ];
  // tslint:enable:object-literal-sort-keys

  const postBody = {
    type,
    characterId: id,
    message: {
      content: null,
      subject: null,
    } // tslint:disable-line:trailing-comma
  };

  if (Cookies.get('userId'))
    postBody.userId = Cookies.get('userId');

  sweet
    .mixin({
      allowOutsideClick: () => !sweet.isLoading(),
      progressSteps: [ 1, 2 ],
      showCancelButton: true,
      titleText: 'Reporting Error(s)...',
    })
    .queue([
      {
        input: 'select',
        inputOptions: types[type],
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
    .then(res => {
      if (!res.value || !res.value.length) return;

      sweet({
        text: 'Now then, we will have to wait...',
        title: 'Report submitted',
        type: 'success',
      });
    })
    .catch(err => sweet({
      titleText: err.message,
      type: 'error',
    }));
}
