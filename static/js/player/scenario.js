$(() => {
  const images = files.filter((v, i, arr) => v.endsWith('.jpg') && arr.indexOf(v) === i);
  const audios = files.filter((v, i, arr) => v.endsWith('.mp3') && arr.indexOf(v) === i);
  const bgm = files.find(i => i.startsWith('bgm_h'));

  const talkVal = parseInt($('#text').attr('data'));
  const maxScriptLength = script.length - 1;
  let animation = 'none';
  let lastImage;
  let lastAudio;
  let sequenceIDX = 0;
  let talkIDX = talkVal;

  const newSeq = () => script[sequenceIDX];
  const maxSequenceTalk = () => newSeq().talk.length - 1;
  const audioSettings = Cookies.getJSON('audio');
  const visualSettings = Cookies.getJSON('visual');

  for (const vSetting of [ 'bg', 'cl', 'cls', 'containDialog', 'fontSize' ])
    updateDialog(vSetting, visualSettings[vSetting], true);

  Howler.volume(audioSettings.glo !== undefined ? audioSettings.glo : 1.0);

  function loadAsset (src, name, type) {
    const deferred = $.Deferred();
    const isBGM = type === 'bgm';
    const asset = type === 'img'
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

    if (type === 'img') {
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
    images
      .filter(el => typeof el !== 'undefined')
      .map(image => loadAsset(SCENARIOS + image, image, 'img'))
    .concat(
      audios
      .filter(el => typeof el !== 'undefined')
      .map(audio => loadAsset(SCENARIOS + audio, audio, 'snd')),
      [ loadAsset(SCENARIOS + bgm, bgm, 'bgm') ],
    ),
  );

  $.when.apply(null, _assets)
    .done((...assets) => {
      for (const asset of assets)
        switch (asset.type) {
          case 'img': {
            $('<img/>', {
              id: asset.name,
              src: asset.src,
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

      setTimeout(() => {
        sweet({
          html: [
            'Click OK to proceed.',
            'For navigation help, see <b>HELP</b> at the sidebar.',
          ].join('<br><br>'),
          titleText: 'Assets loaded!',
        }).then(() => {
          $('.panel').addClass('animated faster fadeIn');
          audioPool[bgm].play();
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
      default: return;
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

  function render () {
    const n = {
      chara: newSeq().talk[talkIDX].chara,
      img: newSeq().sequence,
      voice: audioPool[newSeq().talk[talkIDX].voice],
      words: newSeq().talk[talkIDX].words,
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
      display: 'none',
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
            display: '',
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
            animation: animation, // tslint:disable-line:object-literal-shorthand
            display: '',
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
