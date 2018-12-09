/* eslint-disable no-undef, no-use-before-define, no-invalid-this */

$(() => {
  const audio = script.filter(i => i.voice).map(i => i.voice);
  const bgs = script.filter(i => i.bg).map(i => i.bg);
  const bgms = script.filter(i => i.bgm).map(i => i.bgm);
  const expressions = script.filter(i => i.expression).map(i => i.expression);

  const audioPool = {};
  const bgmPool = {};
  const maxScriptLength = script.length - 1;
  let lastScriptIDX = -1;
  let currentScriptIDX = 0;

  const lastScript = () => script[lastScriptIDX];
  const currentScript = () => script[currentScriptIDX];

  let bgEl = [];
  let exEl = [];

  for (const bg of bgs)
    if (bgEl.includes(bg)) continue;
    else {
      $('<div/>', { id: bg })
        .css({
          'background-image': `url('${msc}/${bg}')`,
          position: 'absolute',
          visibility: 'hidden',
          'z-index': -2,
          width: '640px',
          height: '640px',
          top: 0
        })
        .appendTo('#image');

      bgEl.push(bg);
    }

  for (const expression of expressions)
    if (exEl.includes(expression)) continue;
    else {
      $('<div/>', { id: expression })
        .css({
          'background-image': `url('${msc}/${expression}')`,
          position: 'absolute',
          visibility: 'hidden',
          'z-index': -1,
          width: '640px',
          height: '640px',
          top: 0
        })
        .appendTo('#image');

      exEl.push(expression);
    }

  bgEl = [];
  exEl = [];

  for (const voice of audio)
    if (audioPool[voice]) continue;
    else
      Object.assign(audioPool, {
        [voice]: new Howl({
          src: [`${res}/${voice}`],
          preload: true
        })
      });

  for (const bgm of bgms)
    if (bgmPool[bgm]) continue;
    else
      Object.assign(bgmPool, {
        [bgm]: new Howl({
          src: [`${msc}/${bgm}`],
          preload: true,
          loop: true,
          volume: 0.50
        })
      });

  render();

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

  function navLeft() {
    if (currentScriptIDX === 0) return;

    lastScriptIDX = currentScriptIDX;
    currentScriptIDX--;

    render();
  }

  function navRight() {
    if (currentScriptIDX === maxScriptLength)
      return window.history.back();

    lastScriptIDX = currentScriptIDX;
    currentScriptIDX++;

    render();
  }

  function render() {
    const last = lastScript()
      ? {
        expression: lastScript().expression || null,
        chara: lastScript().chara || null,
        voice: audioPool[lastScript().voice] || null,
        bg: lastScript().bg || null,
        bgm: bgmPool[lastScript().bgm] || null
      }
      : {
        expression: null,
        chara: null,
        voice: null,
        bg: null,
        bgm: null
      };

    const current = {
      expression: currentScript().expression || null,
      chara: currentScript().chara,
      words: currentScript().words,
      voice: audioPool[currentScript().voice] || null,
      bg: currentScript() ? currentScript().bg : null,
      bgm: currentScript() ? bgmPool[currentScript().bgm] : null
    };

    const shown = {
      position: 'relative',
      visibility: 'visible'
    };
    const hidden = {
      position: 'absolute',
      visibility: 'hidden'
    };
    const lastIMG = $(`#image > div[id='${last.bg}']`);
    const currentIMG = $(`#image > div[id='${current.bg}']`);

    if (last.bgm !== current.bgm) {
      if (last.bgm)
        last.bgm.stop();

      if (current.bgm)
        current.bgm.play();
    } else if (last.bgm === current.bgm && !last.bgm.playing())
      last.bgm.play();

    if (last.bg !== current.bg) {
      if (last.bg)
        lastIMG.css({ visibility: 'hidden' });

      if (current.bg)
        currentIMG.css({ visibility: 'visible' });
    }

    $('.characterName')
      .html(current.chara);
    $('.characterTalk')
      .html(current.words);

    if (last.expression)
      $(`#image > div[id='${last.expression}']`)
        .css(hidden);

    if (current.expression)
      $(`#image > div[id='${current.expression}']`)
        .css(shown);

    if (last.voice)
      last.voice.stop();

    if (current.voice)
      current.voice.play();
  }
});
