/* eslint-disable no-undef, no-use-before-define, no-invalid-this */

$(() => {
  const images = files.filter(i => i.endsWith('.jpg'));
  const scr = script.filter(i => !i.sequence.includes('pink'));

  const maxScriptLength = scr.length - 1;
  let animation = 'play 1s steps(1) infinite';
  let lastImage;
  let sequenceIDX = 0;

  const newSeq = () => scr[sequenceIDX];

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
    if (sequenceIDX === 0) return;

    sequenceIDX--;
    animation = `play ${newSeq().seconds}s steps(${newSeq().steps}) infinite`;
  }

  function navRight() {
    if (sequenceIDX === maxScriptLength) return window.history.back();

    sequenceIDX++;
    animation = `play ${newSeq().seconds}s steps(${newSeq().steps}) infinite`;
  }

  function render() {
    const img = newSeq().sequence;

    $('#panel')
      .attr('sequence', sequenceIDX);

    const currentIMG = `#image > div[id='${img}']`;
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

    if (lastImage && lastImage !== img)
      $(`#image > div[id='${lastImage}']`)
        .css(hidden);

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

    lastImage = img;
  }
});
