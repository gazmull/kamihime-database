$(async () => {
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
  let autoDialogTimeout: NodeJS.Timeout;

  const lastScript = () => script[lastScriptIDX];
  const currentScript = () => script[currentScriptIDX];

  sweet.fire({
    allowEscapeKey: false,
    allowOutsideClick: false,
    animation: false,
    customClass: 'animated popOut',
    showConfirmButton: false,
    titleText: 'Resolving assets...'
  });

  const _assets = [
    ...expressions
      .map(expression => ({ src: MISC + expression, name: expression, type: 'img' })),
    ...bgs
      .map(bg => ({ src: MISC + bg, name: bg, type: 'bg' })),
    ...audios
      .map(audio => ({ src: SCENARIOS + audio, name: audio, type: 'snd' })),
    ...bgms
      .map(bgm => ({ src: MISC + bgm, name: bgm, type: 'bgm' })),
  ] as IAsset[];

  try {
    const assets = await loadAssets(_assets, { withSound: true, updateVisuals: true });

    for (const asset of assets)
      switch (asset.type) {
        case 'img':
        case 'bg':
          $('<div/>', { id: asset.name })
            .css({
              'background-image': `url(${asset.src})`,
              display: 'none',
              'z-index': asset.type === 'img' ? -1 : -2
            })
            .appendTo('#image');
          break;
        default:
          Object.assign(audioPool, { [asset.name]: asset.obj });
          break;
      }

    setTimeout(async () => {
      await sweet.fire({
        text: 'Click OK to proceed.',
        titleText: 'Assets loaded!'
      });
      $('.panel').addClass('animated faster fadeIn');

      return render();
    }, 1000);
  } catch (err) {
    console.log(err); // tslint:disable-line:no-console

    return sweet.fire({
      html: 'An error occurred while loading the assets: <br>' + err.message,
      titleText: 'Failed to resolve assets'
    });
  }

  $('button').on('click', function () {
    const code = $(this).attr('nav');

    switch (code) {
      case 'left':
        navLeft();
        break;
      case 'right':
        navRight();
        break;
    }
  });

  $(this).on('keyup', e => {
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
    if (currentScriptIDX === maxScriptLength) return;

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
        voice: audioPool[lastScript().voice] || null
      }
      : {
        bg: null,
        bgm: null,
        chara: null,
        expression: null,
        voice: null
      };

    const current = {
      bg: currentScript() ? currentScript().bg : null,
      bgm: currentScript() ? audioPool[currentScript().bgm] : null,
      chara: currentScript().chara,
      expression: currentScript().expression || null,
      voice: audioPool[currentScript().voice] || null,
      words: currentScript().words
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
      .text(current.words.replace(/\{\{主人公\}\}/g, (settings.visual.name)));

    if (last.expression)
      $(`#image div[id='${last.expression}']`)
        .css('display', 'none');

    if (current.expression)
      $(`#image div[id='${current.expression}']`)
        .css('display', '');

    if (last.voice)
      last.voice.stop();

    if (current.voice) {
      current.voice.play();

      if (settings.visual.autoDialog) {
        if (last.voice) last.voice.off('end');
        if (autoDialogTimeout) clearTimeout(autoDialogTimeout);

        current.voice.once('end', navRight);
      }
    }
    if (!current.voice && settings.visual.autoDialog) {
      if (last.voice) last.voice.off('end');
      if (autoDialogTimeout) clearTimeout(autoDialogTimeout);

      autoDialogTimeout = setTimeout(navRight, getTextShowTime(current.words));
    }
  }
});
