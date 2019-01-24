$(() => {
  const audios = script
    .map(v => v.voice)
    .filter(v => v);
  const bgs = script
    .map(i => i.bg)
    .filter((v, i, arr) => v && arr.indexOf(v) === i);
  const bgms = script
    .map(v => v.bgm)
    .filter((v, i, arr) => v && arr.indexOf(v) === i);
  const expressions = script
    .map(v => v.expression)
    .filter((v, i, arr) => v && arr.indexOf(v) === i);

  const maxScriptLength = script.length - 1;
  let lastScriptIDX = -1;
  let currentScriptIDX = 0;

  const lastScript = () => script[lastScriptIDX];
  const currentScript = () => script[currentScriptIDX];
  const audioSettings = jc.getJSON('audio');
  const visualSettings = jc.getJSON('visual');

  for (const vSetting of [ 'bg', 'cl', 'cls', 'containDialog', 'fontSize' ])
    updateDialog(vSetting, visualSettings[vSetting], true);

  Howler.volume(audioSettings.glo !== undefined ? audioSettings.glo : 1.0);

  function loadAsset (src, name, type) {
    const deferred = $.Deferred();
    const isImage = type === 'img' || type === 'bg';
    const isBGM = type === 'bgm';
    const asset = isImage
      ? new Image()
      : new Howl({
        loop: isBGM ? true : false,
        onload: () => deferred.resolve({ obj: asset, src, name, type }),
        onloaderror: (_, err) => deferred.reject(err + ` [type: ${type}, name: ${name}]`),
        preload: true,
        src: [ src ],
        volume: isBGM
          ? (audioSettings.bgm !== undefined ? audioSettings.bgm : 0.10)
          : (audioSettings.snd !== undefined ? audioSettings.snd : 0.50),
      });

    if (isImage) {
      asset.onload = () => deferred.resolve({ src, name, type });
      asset.onerror = () => deferred.reject(new Error('URL does not return OK status: ' + src));
      asset.src = src;
    }

    return deferred.promise();
  }

  const _assets = [];

  sweet({
    allowEscapeKey: false,
    allowOutsideClick: false,
    animation: false,
    customClass: 'animated zoomIn',
    showConfirmButton: false,
    titleText: 'Resolving assets...',
  });

  Array.prototype.push.apply(
    _assets,
    expressions
      .filter(el => typeof el !== 'undefined')
      .map(expression => loadAsset(FG_IMAGE + expression, expression, 'img'))
    .concat(
      bgs
        .filter(el => typeof el !== 'undefined')
        .map(bg => loadAsset(BG_IMAGE + bg, bg, 'bg')),
      audios
        .filter(el => typeof el !== 'undefined')
        .map(audio => loadAsset(SCENARIOS + `sound/${audio}`, audio, 'snd')),
      bgms
        .filter(el => typeof el !== 'undefined')
        .map(bgm => loadAsset(BGM + bgm, bgm, 'bgm')),
    ),
  );

  $.when.apply(null, _assets)
    .done((...assets) => {
      for (const asset of assets)
        switch (asset.type) {
          case 'img':
          case 'bg': {
            $('<div/>', { id: asset.name })
              .css({
                'background-image': `url(${asset.src})`,
                display: 'none',
                'z-index': asset.type === 'img' ? -1 : -2,
              })
              .appendTo('#image');
            break;
          }
          default: {
            Object.assign(audioPool, { [asset.name]: asset.obj });
            break;
          }
        }

      setTimeout(() => {
        sweet({
          html: [
            'Click OK to proceed.',
            'For navigation help, see <b>HELP</b> at the sidebar.',
          ].join('<br><br>'),
          titleText: 'Assets loaded!',
        }).then(() => {
          $('.panel').addClass('animated faster fadeIn');
          render();
        });
      }, 1000);
    })
    .fail(err => {
      console.log(err); // tslint:disable-line:no-console
      sweet({
        html: 'An error occurred while loading the assets. <sub>(See console)</sub>',
        titleText: 'Failed to resolve assets',
        type: 'error',
      });
    });

  $('button').click(({ currentTarget: $this }) => {
    const code = $($this).attr('nav');

    switch (code) {
      case 'left':
        navLeft();
        break;
      case 'right':
        navRight();
        break;
    }
  });

  $(this).keyup(e => {
    const code = e.keyCode || e.which || e.charCode;

    switch (code) {
      case 37:
        navLeft();
        break;
      case 39:
        navRight();
        break;
    }
  });

  function navLeft () {
    if (currentScriptIDX === 0) return;

    lastScriptIDX = currentScriptIDX;
    currentScriptIDX--;

    render();
  }

  function navRight () {
    if (currentScriptIDX === maxScriptLength)
      return window.history.back();

    lastScriptIDX = currentScriptIDX;
    currentScriptIDX++;

    render();
  }

  function render () {
    const last = lastScript()
      ? {
        bg: lastScript().bg || null,
        bgm: audioPool[lastScript().bgm] || null,
        chara: lastScript().chara || null,
        expression: lastScript().expression || null,
        voice: audioPool[lastScript().voice] || null,
      }
      : {
        bg: null,
        bgm: null,
        chara: null,
        expression: null,
        voice: null,
      };

    const current = {
      bg: currentScript() ? currentScript().bg : null,
      bgm: currentScript() ? audioPool[currentScript().bgm] : null,
      chara: currentScript().chara,
      expression: currentScript().expression || null,
      voice: audioPool[currentScript().voice] || null,
      words: currentScript().words,
    };

    const lastIMG = $(`#image div[id='${last.bg}']`);
    const currentIMG = $(`#image div[id='${current.bg}']`);

    if (last.bgm !== current.bgm) {
      if (last.bgm)
        last.bgm.stop();

      if (current.bgm)
        current.bgm.play();
    } else if (last.bgm === current.bgm && !last.bgm.playing())
      last.bgm.play();

    if (last.bg !== current.bg) {
      if (last.bg)
        lastIMG.css('display', 'none');

      if (current.bg)
        currentIMG.css('display', '');
    }

    $('#characterName')
      .text(current.chara);
    $('#characterTalk')
      .text(current.words);

    if (last.expression)
      $(`#image div[id='${last.expression}']`)
        .css('display', 'none');

    if (current.expression)
      $(`#image div[id='${current.expression}']`)
        .css('display', '');

    if (last.voice)
      last.voice.stop();

    if (current.voice)
      current.voice.play();
  }
});
