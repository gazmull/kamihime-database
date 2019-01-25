let jc = Cookies;
let searchTimeout;
let settings;
const searchController = new AbortController();
const searchSignal = searchController.signal;

$(() => {
  jc = Cookies.withConverter({
    read: value => {
      value = value.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);

      return value.slice(0, 2) === 'j:' ? value.slice(2) : value;
    },
    write: value => {
      try {
        const tmp = JSON.parse(value);
        if (typeof tmp !== 'object') throw undefined;
        if (jc.get('isUser')) tmp.updatedAt = Date.now();
        value = 'j:' + JSON.stringify(tmp);
      } catch { } // tslint:disable-line:no-empty

      return encodeURIComponent(String(value))
        .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
    },
  });
  settings = jc.getJSON('settings');

  saveSettings();

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
      animation: false,
      background: '#333',
      buttonsStyling: false,
      customClass: 'animated fadeIn faster',
    });

  $('.nav-switch').on('click', ({ currentTarget: $this }) => {
    const nav = $('.side-nav');

    if (nav.hasClass('nav-hidden')) {
      nav.removeClass('nav-hidden');
      $($this).addClass('nav-switch-hide');

      saveSettings('menu', true);
    } else {
      nav.addClass('nav-hidden');
      $($this).removeClass('nav-switch-hide');

      saveSettings('menu', false);
    }
  });

  if ($('.side-nav').length && settings.menu)
    setTimeout(() => {
      $('.side-nav').removeClass('nav-hidden');
      $('.nav-switch').addClass('nav-switch-hide');
    }, 801);

  $('.navbar-toggler, #result-close').on('click', () => {
    $('#search-bar').val('');
    $('#search-bar').trigger('input');
  });

  $('#search-bar').on('input',  function () {
    const query = $(this).val();

    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchController.abort();
    }
    if (!query) {
      $('body')
        .removeClass('modal-open')
        .width('auto');

      return $('#result-wrapper').css('transform', '');
    }
    if (window.pageYOffset !== 0)
      window.scrollTo(0, 0);

    const oldWidth = $('body').innerWidth();

    $('body')
      .addClass('modal-open')
      .width(oldWidth);
    $('#result li').remove();
    $('#result-wrapper').css('transform', 'none');

    if (query.length < 2) return $('#result-head').text('I need 2 or more characters');

    $('#result-head').text('Waiting to finish typing...');

    searchTimeout = setTimeout(async () => {
      $('#result-head').text('Searching...');

      try {
        const response = await fetch(`/api/search?name=${query}&approved=1`, {
          headers: { Accept: 'application/json' },
          signal: searchSignal,
        });
        const result = await response.json();

        if (result.error) return $('#result-head').text(result.error.message);
        if (!result.length) return $('#result-head').text('No match found');

        $('#result-head').text(`${result.length} Found`);
        result.map(el =>
          $('<li>')
            .html([
              `<a href='/info/${el.id}'>`,
                `<img src='/img/wiki/portrait/${encodeURI(el.name).replace(/'/g, '%27')} Portrait.png'>`,
                el.name,
                ` <span class='badge badge-secondary'>${el.tier || el.rarity}</span> `,
                `<span class='badge badge-secondary'>${
                  el.id.startsWith('k')
                    ? 'KAMIHIME'
                    : el.id.startsWith('e')
                      ? 'EIDOLON'
                      : 'SOUL'
                }</span>`,
              '</a>',
            ].join(''))
            .appendTo('#result'),
        );
      } catch (e) { return $('#result-head').text(e); }
    }, 1000);
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

async function saveSettings (key = true, obj, db = false) {
  const isBool = typeof key === 'boolean';

  if (!isBool) {
    settings[key] = obj;
    jc.set('settings', settings);
  }

  const shouldSave = isBool ? key : db;

  if (shouldSave && jc.get('isUser')) {
    const res = await fetch('/api/@me?save=yes', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(res.statusText);
  }

  return true;
}

function isNav () {
  return [ 'nav', 'result' ].some(el => new RegExp(el, 'i').test(this.className));
}
