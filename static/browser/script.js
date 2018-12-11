$(() => {
  if (!Cookies.get('lastNav')) {
    Cookies.set('lastNav', '#all');
    Cookies.set('menu', 'true');

    const alertMsg = `
    <div class="alert alert-dismissible alert-warning" style="z-index: 1337">
      <a href="#" class="close" data-dismiss="alert">&times;</a>
      <b>Heads up!</b> This site uses cookies to save your browsing settings.
    </div>`;

    $('.container-fluid').prepend(alertMsg);
    $('#pop').css('visibility', 'visible');
  }

  if (Cookies.get('menu') === 'false') {
    $('#nav').addClass('nav-hidden');
    $('.nav-switch').removeClass('nav-switch-hide');
  }

  $('.collapse')
    .on('show.bs.collapse', () => {
      $('#search-bar').val('').blur();
      $('.collapse.show').collapse('hide');
    })
    .on('shown.bs.collapse', () => {
      const currentPage = $(`.collapse.show`).attr('id');

      Cookies.set('lastNav', '#' + currentPage);

      $('.content.show .kh-list').attr('class', 'kh-list px-0 visible-browser');
      $(`.nav-link[data-target='${Cookies.get('lastNav')}']`).addClass('active');
    })
    .on('hide.bs.collapse', () => {
      $('#search-bar').val('').blur();
      $('.kh-list.visible-browser .name.hiddenInstant-browser')
        .attr('class', 'name visible-browser')
        .css('position', 'relative');
      $('.kh-list.visible-browser').attr('class', 'kh-list px-0 hidden-browser');
      $(`.nav-link.active`).removeClass('active');
    });

  $(Cookies.get('lastNav')).collapse('show');

  $('#search-bar:input').on('click input keyup', ({ currentTarget: $this }) => {
    let query = $($this).val();
    query = query.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());

    const names = '.kh-list.visible-browser .name';
    const toHide = $(`${names}[name!='${query}']`);
    const toShow = $(`${names}[name*='${query}']`);

    if (query) {
      toHide
        .attr('class', 'name hiddenInstant-browser')
        .css('position', 'absolute');
      toShow
        .attr('class', 'name visible-browser')
        .css('position', 'relative');
    } else
      $(`${names}[class*='hiddenInstant-browser']`)
        .attr('class', 'name visible-browser')
        .css('position', 'relative');
  });

  $('.name')
    .on('mouseenter', ({ currentTarget: $this }) => {
        const name = $($this).attr('name').replace(/'/g, '\\$&');

        $('#thumbnail')
          .css({
            'background-image': `url('/img/wiki/close/${name} Close.png')`,
            visibility: 'visible'
          });
    })
    .on('mouseleave', () => $('#thumbnail').css('visibility', 'hidden'));

  const target = $('#pop-target');
  const pop = $('#pop');
  const _help = new Popper(target, pop, { placement: 'top' });

  target
    .on('mouseenter', () => pop.css('visibility', 'visible'))
    .on('mouseleave', () => pop.css('visibility', 'hidden'));
});

function showHelp () {
  swal({
    closeOnEsc: false,
    icon: 'info',
    text: [
      'ESC: Hide/Show Navigation',
      '1 - 7: Select category (e.g. 1 is for \'All\')',
      '\n',
      'Additional Help:',
      '- Feeds ("Latest" and "Hot 10" Sidebars on the right) are also accessible for navigation.',
      '- You can click the white bar beside navigation bar to hide/show it.'
    ].join('\n'),
    title: 'Keyboard Shortcuts'
  });
}

function showLatest () {
  swal({
    content: {
      attributes: {
        alt: 'Latest Image',
        src: '/latest',
        style: 'width: 100%;'
      },
      element: 'img'
    },
    text: 'http://kamihimedb.thegzm.space/latest'
  });
}
