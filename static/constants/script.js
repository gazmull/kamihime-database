$(() => {
  saveSettings(true);

  if (typeof $().modal !== 'undefined') {
    const tooltips = $('[data-toggle="tooltip"]');

    tooltips.tooltip({
      container: 'body',
      trigger : 'hover',
    });

    tooltips.on('click', ({ currentTarget: $this }) => $($this).tooltip('hide'));
  }

  if (typeof swal !== 'undefined')
    sweet = swal.mixin({
      allowEscapeKey: false,
      backdrop: '#ff00ae2f',
      background: '#7c2962',
      buttonsStyling: false,
    });

  $('.nav-switch').on('click', ({ currentTarget: $this }) => {
    const nav = $('#nav');

    if (nav.hasClass('nav-hidden')) {
      nav.removeClass('nav-hidden');
      $($this).addClass('nav-switch-hide');

      Cookies.set('menu', 'true');
    } else {
      nav.addClass('nav-hidden');
      $($this).removeClass('nav-switch-hide');

      Cookies.set('menu', 'false');
    }
  });

})
  .on('keyup', e => {
    if (
      $('#search-bar').length && $('#search-bar').is(':focus') ||
      $('.swal2-container').length
      ) return;

    const code = e.keyCode || e.which || e.charCode;

    if (code === 27) return $('.nav-switch').triggerHandler('click');

    const toggle = id => {
      const el = $(`.collapse[key='${id}']`);

      if (el.hasClass('show'))
        el.collapse('hide');
      else if (el)
        el.collapse('show');
    };

    return toggle(code);
  });

function showLoginWarning () {
  sweet({
    html: [
      'While you are able to save your settings, accounts that are inactive for 14 days will be deleted.',
      'Click OK to continue to log in.',
    ].join('<br><br>'),
    titleText: 'Login Warning',
    type: 'warning',
  })
  .then(res => {
    if (res.value)
      location.replace('/login');
  });
}

async function saveSettings (key, obj, db = false) {
  const isBool = typeof key === 'boolean';

  if (!isBool)
    Cookies.set(key, typeof obj === 'string' ? obj : { ...obj });

  const shouldSave = isBool ? key : db;

  if (shouldSave && typeof userSettings !== 'undefined') {
    const res = await fetch('/api/@me?save=yes', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(res.statusText);

    return res.json();
  }

  return true;
}
