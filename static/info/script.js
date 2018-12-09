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
