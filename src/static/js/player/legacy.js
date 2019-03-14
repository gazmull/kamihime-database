$(() => {
  const images = files.filter((v, i, arr) => v.endsWith('.jpg') && v !== 'pink_s.jpg' && arr.indexOf(v) === i);
  const scr = script.filter(v => v.sequence !== 'pink_s.jpg');

  const maxScriptLength = scr.length - 1;
  let animation = 'none';
  let lastImage;
  let sequenceIDX = 0;

  const newSeq = () => scr[sequenceIDX];

  function loadImage (src, name) {
    const deferred = $.Deferred();
    const image = new Image();
    image.onload = () => deferred.resolve({ src, name });
    image.onerror = () => deferred.reject(new Error('URL does not return OK status: ' + src));
    image.src = src;

    return deferred.promise();
  }

  const _images = [];

  sweet({
    allowEscapeKey: false,
    allowOutsideClick: false,
    animation: false,
    customClass: 'animated zoomIn',
    showConfirmButton: false,
    titleText: 'Resolving images...',
  });

  Array.prototype.push.apply(
    _images,
    images
      .filter(el => typeof el !== 'undefined')
      .map(image => loadImage(SCENARIOS + image, image)),
  );

  $.when.apply(null, _images)
    .done((...imgs) => {
      for (const img of imgs)
        $('<img/>', {
          id: img.name,
          src: img.src,
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
    })
    .fail(err => {
      console.log(err); // tslint:disable-line:no-console
      sweet({
        html: 'An error occurred while loading the images. <sub>(See console)</sub>',
        titleText: 'Failed to resolve images',
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

  function navLeft () {
    if (sequenceIDX === 0) return;

    sequenceIDX--;
    animation = `play ${newSeq().seconds}s steps(${newSeq().steps}) infinite`;
  }

  function navRight () {
    if (sequenceIDX === maxScriptLength) return window.history.back();

    sequenceIDX++;
    animation = `play ${newSeq().seconds}s steps(${newSeq().steps}) infinite`;
  }

  function render () {
    const img = newSeq().sequence;
    const currentIMG = `#image img[id='${img}']`;
    const hidden = {
      '-moz-animation': '',
      '-ms-animation': '',
      '-o-animation': '',
      '-webkit-animation': '',
      animation: '',
      display: 'none',
    };

    $(currentIMG)
      .css({
        '-moz-animation': animation,
        '-ms-animation': animation,
        '-o-animation': animation,
        '-webkit-animation': animation,
        animation: animation, // tslint:disable-line:object-literal-shorthand
        display: '',
      });

    if (lastImage && lastImage !== img)
      $(`#image img[id='${lastImage}`)
        .css(hidden);

    lastImage = img;
  }
});
