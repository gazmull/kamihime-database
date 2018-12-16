$(() => {
  if (typeof $().modal !== 'undefined')
    $('[data-toggle="tooltip"]').tooltip();

  if (typeof swal !== 'undefined')
    sweet = swal.mixin({
      allowEscapeKey: false,
      backdrop: '#ff00ae2f',
      background: '#7c2962',
      buttonsStyling: false
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
    const code = e.keyCode || e.which || e.charCode;

    if (code === 27) return $('.nav-switch').triggerHandler('click');
    if ($('#search-bar').length && $('#search-bar').is(':focus')) return;

    const toggle = id => {
      const el = $(`.collapse[key='${id}']`);

      if (el.hasClass('show'))
        el.collapse('hide');
      else if (el)
        el.collapse('show');
    };

    return toggle(code);
  });
