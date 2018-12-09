/* eslint-disable */

$(() => {
  $('.toggleForm').click(function() {
    const $btnCode = $(this).attr('nav');
    switch ($btnCode) {
    case 'manual':
      $('#manual').attr('class', 'visible');
      $('#mbtn').css('background-color', '#7289DA');
      $('#auto').attr('class', 'hidden');
      $('#abtn').css('background-color', '#666f8b');
      break;
    case 'auto':
      $('#manual').attr('class', 'hidden');
      $('#mbtn').css('background-color', '#666f8b');
      $('#auto').attr('class', 'visible');
      $('#abtn').css('background-color', '#7289DA');
      break;
    }
  });
});
