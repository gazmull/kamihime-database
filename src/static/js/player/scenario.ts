$(async () => {
  const images = files.filter((v, i, arr) => v && v.endsWith('.jpg') && arr.indexOf(v) === i);
  const audios = files.filter((v, i, arr) => v && !v.startsWith('bgm') && (v.endsWith('.mp3') || v.endsWith('.wav')) && arr.indexOf(v) === i);
  const bgm = files.find(i => i.startsWith('bgm'));

  const talkVal = parseInt($('#text').attr('data'));
  const maxScriptLength = script.length - 1;
  let animation: IAnimation = {
    'animation-name': 'play',
    'animation-delay': '0.1s',
    'animation-duration': '1s',
    'animation-iteration-count': 'infinite',
    'animation-timing-function': 'steps(1)',
    display: ''
  };
  let lastImage: string;
  let pressedLeft: boolean = false;
  let lastAudio: typeof Howl;
  let sequenceIDX = 0;
  let talkIDX = talkVal;
  let autoDialogTimeout: NodeJS.Timeout;

  const newSeq = () => script[sequenceIDX];
  const maxSequenceTalk = () => newSeq().talk.length - 1;

  sweet.fire({
    allowEscapeKey: false,
    allowOutsideClick: false,
    animation: false,
    customClass: 'animated popOut',
    showConfirmButton: false,
    titleText: 'Resolving assets...'
  });

  const _assets = [
    ...images
      .map(image => ({ src: SCENARIOS + image, name: image, type: 'img' })),
    ...audios
      .map(audio => ({ src: SCENARIOS + audio, name: audio, type: 'snd' })),
    { src: MISC + bgm, name: bgm, type: 'bgm' }
  ] as IAsset[];

  try {
    const assets = await loadAssets(_assets, { withSound: true, updateVisuals: true });

    for (const asset of assets)
      switch (asset.type) {
        case 'img': {
          $('<img/>', {
            id: asset.name,
            src: asset.src
          })
            .css('display', 'none')
            .appendTo('#image');
          break;
        }
        default: {
          Object.assign(audioPool, { [asset.name]: asset.obj });
          break;
        }
      }

    setTimeout(async () => {
      await sweet.fire({
        text: 'Click OK to proceed.',
        titleText: 'Assets loaded!'
      })
      $('.panel').addClass('animated faster fadeIn');
      audioPool[bgm].play();

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
        return navLeft();
      case 'right':
        return navRight();
    }
  });

  $(this).on('keyup', e => {
    const code = e.keyCode || e.which || e.charCode;

    switch (code) {
      case 37:
        return navLeft();
      case 39:
        return navRight();
    }
  });

  function navLeft () {
    if (sequenceIDX === 0 && talkIDX === 0) return;
    if (talkIDX === 0) {
      sequenceIDX--;
      talkIDX = maxSequenceTalk();
    } else
      $('#text').attr('data', --talkIDX);

    pressedLeft = true;

    render();
  }

  function navRight () {
    if (sequenceIDX === maxScriptLength && talkIDX === maxSequenceTalk())
      return;
    if (talkIDX === maxSequenceTalk()) {
      sequenceIDX++;
      talkIDX = 0;
    } else
      $('#text').attr('data', ++talkIDX);

    render();
  }

  function render (): any {
    const n = {
      chara: newSeq().talk[talkIDX].chara,
      img: newSeq().sequence,
      voice: audioPool[newSeq().talk[talkIDX].voice],
      words: newSeq().talk[talkIDX].words
    };

    $('.panel').attr('sequence', sequenceIDX);

    const currentIMG = `#image img[id='${n.img}']`;
    const hidden = {
      '-webkit-animation': '',
      animation: '',
      display: 'none'
    };

    if (lastImage && lastImage !== n.img)
      $(`#image img[id='${lastImage}']`).css(hidden);

    if (lastImage !== n.img) {
      if (n.img === 'pink_s.jpg' && pressedLeft) {
        pressedLeft = false;

        return navLeft();
      }
      if (n.img === 'pink_s.jpg') {
        $(currentIMG).css(serialiseAnimation(animation, { fading: true }));
        setTimeout(() => {
          $(currentIMG).css(hidden);

          return navRight();
        }, 1000);
      } else
        $(currentIMG).css(serialiseAnimation(animation, { seconds: newSeq().seconds, steps: newSeq().steps }));
    }

    lastImage = n.img;

    $('#characterName').text(n.chara);
    $('#characterTalk').text(n.words.replace(/\{\{主人公\}\}/g, (settings.visual.name)));

    if (lastAudio && n.voice) lastAudio.stop();
    if (n.voice) {
      n.voice.play();

      if (settings.visual.autoDialog) {
        if (lastAudio) lastAudio.off('end');
        if (autoDialogTimeout) clearTimeout(autoDialogTimeout);

        n.voice.once('end', navRight);
      }

      lastAudio = n.voice;
    }
    if (!n.voice && settings.visual.autoDialog) {
      if (lastAudio) lastAudio.off('end');
      if (autoDialogTimeout) clearTimeout(autoDialogTimeout);

      autoDialogTimeout = setTimeout(navRight, getTextShowTime(n.words));
    }
  }
});
