$(async () => {
  const images = files.filter((v, i, arr) => v && v.endsWith('.jpg') && v !== 'pink_s.jpg' && arr.indexOf(v) === i);
  const scr = script
    .filter((v, i, arr) => v.sequence !== 'pink_s.jpg' && arr.findIndex(sv => sv.sequence === v.sequence) === i)
    .sort((a, b) => a.sequence > b.sequence ? 1 : -1);
  const black = scr.pop();

  scr.unshift(black);

  const maxScriptLength = scr.length - 1;
  let animation: IAnimation = {
    'animation-name': 'play',
    'animation-delay': '0.1s',
    'animation-duration': '1s',
    'animation-iteration-count': 'infinite',
    'animation-timing-function': 'steps(1)',
    display: ''
  };
  let lastImage: string;
  let sequenceIDX = 0;

  const newSeq = () => scr[sequenceIDX];

  sweet.fire({
    allowEscapeKey: false,
    allowOutsideClick: false,
    animation: false,
    customClass: 'animated zoomIn',
    showConfirmButton: false,
    titleText: 'Resolving images...'
  });

  const _imgs = images
    .map(image => ({ src: SCENARIOS + image, name: image, type: 'img' })) as IAsset[];

  try {
      const imgs = await loadAssets(_imgs, {});
      for (const img of imgs)
        $('<img/>', {
          id: img.name,
          src: img.src
        })
          .css('display', 'none')
          .appendTo('#image');

      setTimeout(() => {
        $('.swal2-popup').addClass('animated zoomOut');
        $('.swal2-container').addClass('animated fadeOut');
      }, 1000);
      setTimeout(() => {
        sweet.close();
        $('.panel').addClass('animated faster fadeIn');
        render();
      }, 1350);
  } catch (err) {
    console.log(err); // tslint:disable-line:no-console

    return sweet.fire({
      html: 'An error occurred while loading the images: <br>' + err.message,
      titleText: 'Failed to resolve images'
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
    if (sequenceIDX === 0) return;

    sequenceIDX--;
    render();
  }

  function navRight () {
    if (sequenceIDX === maxScriptLength) return window.history.back();

    sequenceIDX++;
    render();
  }

  function render () {
    const img = newSeq().sequence;
    const currentIMG = `#image img[id='${img}']`;
    const hidden = {
      '-webkit-animation': '',
      animation: '',
      display: 'none'
    };

    if (lastImage && lastImage !== img)
      $(`#image img[id='${lastImage}`).css(hidden);

    $(currentIMG).css(serialiseAnimation(animation, { seconds: newSeq().seconds, steps: newSeq().steps }));

    lastImage = img;
  }
});
