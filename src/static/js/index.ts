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

  const lastRead = jc.get('lastRead');

  if (!lastRead || (lastRead && Number($('#annDate').text()) > Number(lastRead)))
    $('#ann').removeAttr('hidden');
});
