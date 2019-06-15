$(() => {
  $('.latest-panel .btn').on('click', function () {
    const oldBtn = $('.latest-panel .btn.active');
    const newBtn = $(this);

    oldBtn.removeClass('active');

    if (oldBtn.text() !== newBtn.text())
    newBtn.addClass('active');
  });

  const target = $('.latest-panel .btn').first().addClass('active').data('target');

  $(target).collapse('show');
});
