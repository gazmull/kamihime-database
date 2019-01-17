$(() => {
  if (!Cookies.get('lastNav')) {
    Cookies.set('lastNav', '#all');
    Cookies.set('menu', 'true');

    $('[data-toggle="tooltip"]').tooltip('show');
  }

  if (Cookies.get('menu') === 'false') {
    $('#nav').addClass('nav-hidden');
    $('.nav-switch').removeClass('nav-switch-hide');
  }

  $('.collapse')
    .on('show.bs.collapse', function () {
      if (isNav.bind(this)()) return;

      $('.collapse.show').collapse('hide');
    })
    .on('shown.bs.collapse', function () {
      if (isNav.bind(this)()) return;

      const currentPage = '#' + $(`.collapse.show`).attr('id');

      Cookies.set('lastNav', currentPage);

      $('.content.show .kh-list').attr('class', 'kh-list px-0 visible-browser');
      $(`.nav-link[data-target='${Cookies.get('lastNav')}']`).addClass('active');
    })
    .on('hide.bs.collapse', function () {
      if (isNav.bind(this)()) return;

      $('.kh-list.visible-browser .name.hiddenInstant-browser')
        .attr('class', 'name visible-browser')
        .css('position', 'relative');
      $('.kh-list.visible-browser').attr('class', 'kh-list px-0 hidden-browser');
      $(`.nav-link.active`).removeClass('active');
    });

  $(Cookies.get('lastNav')).collapse('show');

  $('.name')
    .on('mouseenter', ({ currentTarget: $this }) => {
        if (!$($this).attr('name')) return;

        const name = $($this).attr('name').replace(/'/g, '\\$&');

        $('#thumbnail')
          .css({
            'background-image': `url('/img/wiki/close/${name} Close.png')`,
            visibility: 'visible',
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
      '<ol style="text-align: justify;">',
      '<li>Feeds ("Latest" and "Top 10" Sidebars on the right) are also accessible for navigation.</li>',
      '<li>You can click the white bar beside navigation sidebar to hide/show it.</li>',
      '<li><u>IMPORTANT!</u> Hiding the navigation sidebar will also hide it to other pages.<br>',
      'Each page that has it has unique options. Watch out for that!</li>',
      '</ol>',
    ].join(''),
    titleText: 'Keyboard Shortcuts',
    type: 'info',
  });
}

function showLatest () {
  sweet({
    html: '<a href="/latest" class="text-light" target="_blank">https://kamihimedb.thegzm.space/latest</a>',
    imageAlt: 'Latest Image',
    imageUrl: '/latest',
    imageWidth: '100%',
  });
}
