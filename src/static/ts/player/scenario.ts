$(async () => {
  const images = files.filter((v, i, arr) => v && v.endsWith('.jpg') && arr.indexOf(v) === i);
  const audios = files.filter((v, i, arr) => v && v.endsWith('.mp3') && arr.indexOf(v) === i);
  const bgm = files.find(i => i.startsWith('bgm_h'));

  const talkVal = parseInt($('#text').attr('data'));
  const maxScriptLength = script.length - 1;
  let animation = 'none';
  let lastImage: string;
  let lastAudio: Howl;
  let sequenceIDX = 0;
  let talkIDX = talkVal;

  const newSeq = () => script[sequenceIDX];
  const maxSequenceTalk = () => newSeq().talk.length - 1;

  sweet({
    allowEscapeKey: false,
    allowOutsideClick: false,
    animation: false,
    customClass: 'animated zoomIn',
    showConfirmButton: false,
    titleText: 'Resolving assets...'
  });

  const _assets = [
    ...images
      .map(image => ({ src: SCENARIOS + image, name: image, type: 'img' })),
    ...audios
      .map(audio => ({ src: SCENARIOS + audio, name: audio, type: 'snd' })),
    { src: SCENARIOS + bgm, name: bgm, type: 'bgm' }
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
      await sweet({
        html: [
          'Click OK to proceed.',
          'For navigation help, see <b>HELP</b> at the sidebar.',
        ].join('<br><br>'),
        titleText: 'Assets loaded!'
      })
      $('.panel').addClass('animated faster fadeIn');
      audioPool[bgm].play();

      return render();
    }, 1000);
  } catch (err) {
    console.log(err); // tslint:disable-line:no-console

    return sweet({
      html: 'An error occurred while loading the assets: <br>' + err.message,
      titleText: 'Failed to resolve assets',
      type: 'error'
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
      default: return;
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
      default: return;
    }
  });

  function navLeft () {
    if (sequenceIDX === 0 && talkIDX === 0) return;
    if (talkIDX === 0) {
      sequenceIDX--;
      animation = `play ${newSeq().seconds}s steps(${newSeq().steps}) infinite`;
      talkIDX = maxSequenceTalk();
    } else
      $('#text').attr('data', --talkIDX);

    render();
  }

  function navRight () {
    if (sequenceIDX === maxScriptLength && talkIDX === maxSequenceTalk())
      return window.history.back();
    if (talkIDX === maxSequenceTalk()) {
      sequenceIDX++;
      animation = `play ${newSeq().seconds}s steps(${newSeq().steps}) infinite`;
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

    $('.panel')
      .attr('sequence', sequenceIDX);

    const currentIMG = `#image img[id='${n.img}']`;
    const hidden = {
      '-moz-animation': '',
      '-ms-animation': '',
      '-o-animation': '',
      '-webkit-animation': '',
      animation: '',
      display: 'none'
    };

    if (lastImage && lastImage !== n.img)
      $(`#image img[id='${lastImage}']`)
        .css(hidden);

    const isC3 = lastImage && lastImage.endsWith('_c3.jpg');

    if (lastImage !== n.img) {
      if (n.img === 'pink_s.jpg' && !isC3) {
        navLeft();

        return render();
      }

      if (n.img === 'pink_s.jpg' && isC3) {
        $(currentIMG)
          .css({
            '-moz-animation': 'fade 1s',
            '-ms-animation': 'fade 1s',
            '-o-animation': 'fade 1s',
            '-webkit-animation': 'fade 1s',
            animation: 'fade 1s',
            display: ''
          });

        setTimeout(() => {
          $(currentIMG)
            .css(hidden);

          navRight();

          return render();
        }, 1000);
      } else
        $(currentIMG)
          .css({
            '-moz-animation': animation,
            '-ms-animation': animation,
            '-o-animation': animation,
            '-webkit-animation': animation,
            animation,
            display: '',
            'will-change': 'transform'
          });
    }

    lastImage = n.img;

    $('#characterName')
      .text(n.chara);
    $('#characterTalk')
      .text(n.words);

    if (lastAudio && n.voice)
      lastAudio.stop();

    if (n.voice) {
      n.voice.play();
      lastAudio = n.voice;
    }
  }
});
