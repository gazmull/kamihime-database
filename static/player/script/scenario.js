/* eslint-disable no-undef, no-use-before-define, no-invalid-this */

$(() => {
  const images = files.filter(i => i.endsWith('.jpg'));
  const audio = files.filter(i => i.endsWith('.mp3') && !i.startsWith('bgm'));

  const audioPool = {};
  const talkVal = parseInt($('#text').attr('data'));
  const maxScriptLength = script.length - 1;
  let animation = 'play 1s steps(1) infinite';
  let lastImage;
  let lastAudio;
  let sequenceIDX = 0;
  let talkIDX = talkVal;

  const newSeq = () => script[sequenceIDX];
  const maxSequenceTalk = () => newSeq().talk.length - 1;

  for (const image of images)
    $('<div/>', {
      id: image,
      class: 'animate'
    })
      .css({
        'background-image': `url("${res}/${image}")`,
        position: 'absolute',
        visibility: 'hidden',
        top: '-130px',
        width: '640px',
        height: '900px'
      })
      .appendTo('#image');

  for (const aud of audio)
    Object.assign(audioPool, {
      [aud]: new Howl({
        src: [`${res}/${aud}`],
        preload: true
      })
    });

  const bgm = files
    .filter(i => i.startsWith('bgm_h'))
    .map(i => `${res}/${i}`);

  new Howl({
    src: bgm,
    preload: true,
    autoplay: true,
    loop: true,
    volume: 0.50
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
      default: return;
    }

    render();
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

    render();
  });

  function navLeft() {
    if (sequenceIDX === 0 && talkIDX === 0) return;
    if (talkIDX === 0) {
      sequenceIDX--;
      animation = `play ${newSeq().seconds}s steps(${newSeq().steps}) infinite`;
      talkIDX = maxSequenceTalk();
    } else
      $('#text').attr('data', --talkIDX);
  }

  function navRight() {
    if (sequenceIDX === maxScriptLength && talkIDX === maxSequenceTalk())
      return window.history.back();
    if (talkIDX === maxSequenceTalk()) {
      sequenceIDX++;
      animation = `play ${newSeq().seconds}s steps(${newSeq().steps}) infinite`;
      talkIDX = 0;
    } else
      $('#text').attr('data', ++talkIDX);
  }

  function render() {
    const n = {
      img: newSeq().sequence,
      chara: newSeq().talk[talkIDX].chara,
      voice: audioPool[newSeq().talk[talkIDX].voice],
      words: newSeq().talk[talkIDX].words
    };

    $('#panel')
      .attr('sequence', sequenceIDX);

    const currentIMG = `#image > div[id='${n.img}']`;
    const hidden = {
      position: 'absolute',
      visibility: 'hidden',
      'background-position-y': '0px',
      animation: 'play 1s steps(1) infinite',
      '-webkit-animation': 'play 1s steps(1) infinite',
      '-moz-animation': 'play 1s steps(1) infinite',
      '-o-animation': 'play 1s steps(1) infinite',
      '-ms-animation': 'play 1s steps(1) infinite'
    };

    if (lastImage && lastImage !== n.img)
      $(`#image > div[id='${lastImage}']`)
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
            position: 'relative',
            visibility: 'visible',
            animation: 'fade 1s',
            '-webkit-animation': 'fade 1s',
            '-moz-animation': 'fade 1s',
            '-o-animation': 'fade 1s',
            '-ms-animation': 'fade 1s'
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
            position: 'relative',
            visibility: 'visible',
            animation: animation, // eslint-disable-line object-shorthand
            '-webkit-animation': animation,
            '-moz-animation': animation,
            '-o-animation': animation,
            '-ms-animation': animation
          });
    }

    lastImage = n.img;

    $('.characterName')
      .html(n.chara);
    $('.characterTalk')
      .html(n.words);

    if (lastAudio && n.voice)
      lastAudio.stop();

    if (n.voice) {
      n.voice.play();
      lastAudio = n.voice;
    }
  }
});
