$(() => {
  $('.browse-panel .btn').on('click', function () {
    const oldBtn = $('.browse-panel .btn.active');
    const newBtn = $(this);

    oldBtn.removeClass('active');

    if (oldBtn.text() !== newBtn.text())
    newBtn.addClass('active');
  });

  let imgTimeout = null;
  $('#browse-parent li a')
    .on('mouseenter', function () {
      if (!this.textContent) return;
      if (imgTimeout) clearTimeout(imgTimeout);

      imgTimeout = setTimeout(() => {
        const name = this.textContent.replace(/'/g, '\\$&');
        const me = $(this);

        if (!me.data('bs.tooltip'))
          me
            .tooltip({
              animation: false,
              html: true,
              title: `<img src="/img/wiki/close/${name} Close.png" />`,
              placement: "auto",
              trigger: 'manual'
            })
        if ($('.modal-open').length) return; // Fix for mobile (popping up when only pressed)

        return me.tooltip('show');
      }, 300);
    })
    .on('mouseleave', function () {
      if (imgTimeout) clearTimeout(imgTimeout);
      $(this).tooltip('hide');
    });

  const target = $('.browse-panel .btn').first().addClass('active').data('target');

  $(target).collapse('show');
});
