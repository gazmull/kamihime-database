/* eslint-disable */
$(function() {
  const baseURL = '/scenarios/';
  const $val_arr = ['a', 'b', 'c1', 'c2', 'c3', 'd'];
  const $val = $('#animHime').attr('data');

  let $val_new = $val_arr.indexOf($val);
  let $val_animation = 'play 1s steps(1) infinite';

  $('button').click(function() {
    const $btnCode = $(this).attr('nav');
    switch ($btnCode) {
    case 'left':
      if ($val_new < 1) return;
      nav_left();
      break;
    case 'right':
      if ($val_new === 5) return;
      nav_right();
      break;
    }
    render();
  });

  $(this).keyup(e => {
    const $charCode = e.keyCode || e.which || e.charCode;
    switch ($charCode) {
    case 37:
      if ($val_new < 1) return;
      nav_left();
      break;
    case 39:
      if ($val_new === 5) return;
      nav_right();
      break;
    default: return;
    }
    render();
  });

  function nav_left() {
    switch ($val_new) {
    case 5:
      $val_animation = 'play 2s steps(16) infinite';
      $val_new--;
      break;
    case 4:
    case 3:
      $val_animation = 'play .67s steps(16) infinite';
      $val_new--;
      break;
    case 2:
      $val_animation = 'play 1s steps(16) infinite';
      $val_new--;
      break;
    case 1:
      $val_animation = 'play 1s steps(1) infinite';
      $val_new--;
      break;
    }
  }

  function nav_right() {
    switch ($val_new) {
    case 4:
      $val_animation = 'play 1s steps(1) infinite';
      $val_new++;
      break;
    case 3:
      $val_animation = 'play 2s steps(16) infinite';
      $val_new++;
      break;
    case 2:
    case 1:
      $val_animation = 'play .67s steps(16) infinite';
      $val_new++;
      break;
    case 0:
      $val_animation = 'play 1s steps(16) infinite';
      $val_new++;
      break;
    default:
      $val_animation = 'play 2s steps(1) infinite';
      $val_new++;
      break;
    }
  }

  function render() {
    const $img = `${baseURL}${$.urlParam(0)}/${$.urlParam(2)}/${$.urlParam(0).slice(1)}-${Number($.urlParam(1)) === 2 ? 2 : 3}-2_${$val_arr[$val_new]}.jpg`;
    $('#animHime')
      .css({
        visibility: 'hidden',
        'background-image': `url('${$img}')`,
        animation: 'play 1s steps(1) infinite',
        '-webkit-animation': 'play 1s steps(1) infinite',
        '-moz-animation': 'play 1s steps(1) infinite',
        '-o-animation': 'play 1s steps(1) infinite',
        '-ms-animation': 'play 1s steps(1) infinite'
      });
    $('.seq')
      .html('<b>Loading...</b>');
    $('body').waitForImages(true).done(() => {
      $('#animHime')
        .css({
          visibility: 'visible',
          animation: $val_animation,
          '-webkit-animation': $val_animation,
          '-moz-animation': $val_animation,
          '-o-animation': $val_animation,
          '-ms-animation': $val_animation
        })
        .attr('data', $val_arr[$val_new]);
      $('.seq')
        .html(`<b>Sequence: ${$val_arr[$val_new].toUpperCase()}</b>`)
        .attr('href', $img);
    });
  }

  $.urlParam = function(id) {
    const results = (window.location.pathname).split('/').slice(2, 5);

    return results[id];
  };
});
