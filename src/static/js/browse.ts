$(() => {
  $('.browse-panel .btn').on('click', function () {
    const oldBtn = $('.browse-panel .btn.active');
    const newBtn = $(this);

    oldBtn.removeClass('active');

    if (oldBtn.text() !== newBtn.text())
    newBtn.addClass('active');
  });

  const target = $('.browse-panel .btn').first().addClass('active').data('target');

  $(target).collapse('show');
});
