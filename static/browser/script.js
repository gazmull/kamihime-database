$(() => {
  if (!Cookies.get('lastNav')) {
    Cookies.set('lastNav', '#all');
    Cookies.set('menu', 'true');

    const alertMsg = `
    <div class="alert alert-dismissible alert-warning fade show" style="z-index: 1337">
      <a href="#" class="close" data-dismiss="alert">&times;</a>
      <h4 class='alert-heading'>Heads up!</h4>
      <p>This site uses cookies to save your browsing settings.</p>
    </div>`;

    $('.container-fluid').prepend(alertMsg);
    $('[data-toggle="tooltip"]').tooltip('show');
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
});

function showHelp () {
  sweet({
    html: [
      '<ol style="list-style: none; padding: 0;">',
      '<li>ESC: Hide/Show Navigation</li>',
      '<li>1 - 7: Select category (e.g. 1 is for \'All\')</li>',
      '</ol><br><br>',
      'Additional Help:',
      '<ol>',
      '<li>Feeds ("Latest" and "Hot 10" Sidebars on the right) are also accessible for navigation.</li>',
      '<li>You can click the white bar beside navigation bar to hide/show it.</li>',
      '</ol>'
    ].join(''),
    titleText: 'Keyboard Shortcuts',
    type: 'info'
  });
}

function showLatest () {
  sweet({
    html: '<a href="/latest" class="text-light" target="_blank">http://kamihimedb.thegzm.space/latest</a>',
    imageAlt: 'Latest Image',
    imageUrl: '/latest',
    imageWidth: '100%'
  });
}
