let jc: Cookies.CookiesStatic<ISettings> = Cookies;
let searchController: AbortController;
let searchTimeout: NodeJS.Timeout;

$(async () => {
  jc = Cookies.withConverter({
    read: value => {
      value = value.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);

      return value.slice(0, 2) === 'j:' ? value.slice(2) : value;
    },
    write: (value: string) => {
      try {
        const tmp = JSON.parse(value);
        if (typeof tmp !== 'object') throw undefined;
        if (jc.get('isUser')) tmp.updatedAt = Date.now();
        value = 'j:' + JSON.stringify(tmp);
      } catch { } // tslint:disable-line:no-empty

      return encodeURIComponent(String(value))
        .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
    }
  });
  settings = jc.getJSON('settings');

  saveSettings();

  if (typeof $().modal !== 'undefined') {
    const tooltips = $('[data-toggle="tooltip"]');

    tooltips.tooltip({
      container: 'body',
      trigger : 'hover',
    });

    tooltips.on('click', ({ currentTarget }) => $(currentTarget).tooltip('hide'));

    $('.modal')
      .on('show.bs.modal', async function (e) { await handleModalShow().call(this, e); })
      .on('hide.bs.modal', handleModalHide());
  }

  if (typeof swal !== 'undefined')
    sweet = swal.mixin({
      allowEscapeKey: false,
      animation: false,
      background: '#333',
      buttonsStyling: false,
      customClass: {
        popup: 'animated popOut',
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
    });

  $('.nav-switch').on('click', function () {
    const nav = $('.side-nav');

    if (nav.hasClass('nav-hidden')) {
      nav.removeClass('nav-hidden');
      $(this).addClass('nav-switch-hide');

      saveSettings('menu', true);
    } else {
      nav.addClass('nav-hidden');
      $(this).removeClass('nav-switch-hide');

      saveSettings('menu', false);
    }
  });

  $('.navbar-toggler, #result-close').on('click', () => {
    if (searchController) searchController.abort();

    $('#search-bar').val('');
    $('#search-bar').trigger('input');
  });

  $('#search-bar').on('input',  function () {
    const query = $(this).val() as string;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchController.abort();
    }
    if (!query) {
      $('body').removeClass('modal-open');

      return $('#result-wrapper').css('transform', '');
    }
    if (window.pageYOffset !== 0)
      window.scrollTo(0, 0);

    searchController = new AbortController();
    const signal = searchController.signal;

    $('body').addClass('modal-open');
    $('#result li').remove();
    $('#result.list-group').removeClass('animated popOut');
    $('#result-wrapper').css('transform', 'none');

    if (query.length < 2) return $('#result-head').text('I need 2 or more characters');

    $('#result-head').text('Waiting to finish typing...');

    searchTimeout = setTimeout(async () => {
      $('#result-head').text('Searching...');

      try {
        const response = await fetch(`/api/search?name=${query}&approved=1`, {
          headers: { Accept: 'application/json' },
          signal,
        });
        const result: IKamihime[] = await response.json();
        const error = (result as any).error;

        if (error) return $('#result-head').text(error.message);
        if (!result.length) return $('#result-head').text('No match found');

        $('#result-head').text(`${result.length} Found`);
        result.map(el =>
          $('<li>')
            .html([
              `<a href='javascript:void(0);' data-char='${el.id}' data-toggle='modal' data-target='.modal'></a>`,
              `<img data-src='/img/wiki/portrait/${encodeURI(el.name).replace(/'/g, '%27')} Portrait.png'>`,
              `<span>${el.name}</span>`,
              ` <span class='badge badge-secondary'>${(el.tier || el.rarity).toUpperCase()}</span> `,
              `<span class='badge badge-secondary'>${
                el.id.startsWith('k')
                  ? 'KAMIHIME'
                  : el.id.startsWith('e')
                    ? 'EIDOLON'
                    : 'SOUL'
              }</span>`,
            ].join(''))
            .appendTo('#result'),
        );

        await readyImages($('#result.list-group img'));
        $('#result.list-group').addClass('animated popOut');
      } catch (e) { if (e.name !== 'AbortError') return $('#result-head').text(e); }
    }, 1000);
  });

  await readyImages($('img'));
  $('.container-fluid').addClass('animated popOut');
});

async function showLoginWarning () {
  const res = await sweet.fire({
    html: [
      'By logging in, you will have the benefits of:',
      '- Higher episode visits limit (5 => 10)',
      '- Player settings saved remotely',
      '- Custom Device Successor name (Discord username)',
      '<br>While you are able to save your settings, accounts that are inactive for 14 days will be deleted.',
      '<br>Click OK to continue to log in.',
    ].join('<br>'),
    titleText: 'Login'
  });

  if (res.value)
    location.replace('/login');
}

async function saveSettings (key: string | boolean = true, obj?: {}, db = false) {
  const isBool = typeof key === 'boolean';

  if (!isBool) {
    settings[key as string] = obj;
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

function readyImages (images: JQuery<HTMLElement>) {
  return Promise.all(images.map(
    function () {
      return new Promise(res => {
        const src = this.getAttribute('data-src');

        if (!src) return res(true);

        const img = new Image();
        img.src = src;
        img.onload = () => {
          this.setAttribute('src', src);

          return res(true);
        };
        img.onerror = () => {
          this.setAttribute('alt', 'Could not load the image.');

          return res(true);
        };
      });
    }
  ));
}

function handleModalShow (): (this: HTMLElement, e: ModalEventHandler) => void {
  return async function (e) {
    const modal = $(this);
    modal.find('.modal-dialog').addClass('invisible');

    const char = $(e.relatedTarget).data('char');
    const handleFancyModal = async () => {
      const sleep = () => new Promise(res => setTimeout(res, 256));

      await readyImages($('.modal-background img'));
      await sleep();

      return modal.find('.modal-dialog')
          .attr('class', 'modal-dialog modal-dialog-centered animated popOut')
    };
    const url = `/api/${char === 'random' ? 'random': `id/${char}`}`;
    const request = await fetch (url, {
      headers: { Accept: 'application/json' }
    });

    if (!request.ok) return modal.find('.modal-title').text('Failed to retrieve character');

    let data = await request.json() as IKamihime;

    if (char === 'random') data = data[0];

    const src = `/img/wiki/${data.preview}`;
    const type = data.id.startsWith('s') ? 'SOUL' : data.id.startsWith('e') ? 'EIDOLON' : 'KAMIHIME';
    const linkify = (episode: number) => [
      `<h5>Episode ${episode}</h5>`,
      '<ul>',
      [ 'Story', episode === 1 ? '' : 'Scenario', episode === 1 ? '' : 'Legacy' ]
        .filter(v => v)
        .map(v => `<li><a href="/player/${data.id}/${episode}/${v.toLowerCase()}">${v}</a></li>`)
        .join(''),
      '</ul>',
    ].join('');
    const episodes = [ 'R', 'SSR+' ].includes(data.rarity) || [ 'e', 's' ].includes(data.id.charAt(0))
      ? [ 1, 2 ]
      : [ 1, 2, 3 ];

    modal.find('.modal-title').text(data.name);
    modal.find('.modal-background img').attr('data-src', src);
    modal.find('.modal-body p').html([
      `<span class="badge badge-primary">${Number(data.peeks).toLocaleString('en')} VIEWS</span>`,
      [ data.tier || data.rarity, type ].map(v => `<span class="badge badge-secondary">${v}</span>`).join(' '),
    ].join(' '));
    modal.find('.modal-body-episodes-list').html(episodes.map(linkify).join(''));

    await handleFancyModal();
  };
}

function handleModalHide (): (this: HTMLElement, e: ModalEventHandler) => void {
  return function () {
    const modal = $(this);

    modal.find('.modal-dialog')
      .attr('class', 'modal-dialog modal-dialog-centered animated popIn');
  };
}
