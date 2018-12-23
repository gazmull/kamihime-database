$(() => {
  sweet = sweet.mixin({ heightAuto: false });

  if (!Cookies.getJSON('audio')) {
    saveSettings('audio', {
      bgm: 0.1,
      glo: 1.0,
      snd: 0.5,
    }, true);

    saveSettings('visual', {
      bg: 'rgb(255, 183, 183)',
      cl: 'rgb(190, 50, 74)',
    }, true);
  }

  if (Cookies.get('menu') === 'false') {
    $('#nav').addClass('nav-hidden');
    $('.nav-switch').removeClass('nav-switch-hide');
  }
});

const audioPool = {};
const audioFilter = fn => Object.keys(audioPool).filter(fn);

function showHelp () {
  sweet({
    html: [
      '<ol style="list-style: none; padding: 0;">',
      '<li>Audio - Changes player Global/Voice/Music sound volume</li>',
      '<li>Visual - Changes player frame properties</li>',
      '</ol><br><br>',
      '<a class="text-light">Everything is saved if you are logged in, or until you exit your browser as a guest.</a>',
    ].join(''),
    titleText: 'Player Settings',
    type: 'info',
  });
}

function showAudioSettings () {
  const snd1 = audioPool[audioFilter(el => !el.startsWith('bg'))[0]];
  const bgm1 = audioPool[audioFilter(el => el.startsWith('bg'))[0]];
  sweet({
    allowOutsideClick: () => !sweet.isLoading(),
    // tslint:disable:max-line-length
    html: `
          <h6 id="glo-range-val">Global - ${Howler.volume()}</h6>
          <input id="glo" class="custom-range" type="range" min="0.0" max="1.0" step="0.01" value=${Howler.volume()} oninput="showRangeVal(this);">
          <h6 id="snd-range-val">Audio - ${snd1.volume()}</h6>
          <input id="snd" class="custom-range" type="range" min="0.0" max="1.0" step="0.01" value=${snd1.volume()} oninput="showRangeVal(this);">
          <h6 id="bgm-range-val">Music - ${bgm1.volume()}</h6>
          <input id="bgm" class="custom-range" type="range" min="0.0" max="1.0" step="0.01" value=${bgm1.volume()} oninput="showRangeVal(this);">
        `,
      // tslint:enable:max-line-length
    preConfirm: async () => {
      const glo = Number($('#glo').val());
      const snd = Number($('#snd').val());
      const bgm = Number($('#bgm').val());
      const arr = [ glo, snd, bgm ];

      if (Howler.volume() === glo && snd1.volume() === snd && bgm1.volume() === bgm)
        throw new Error('Nothing changed.');

      try {
        const valid = arr.filter(el => {
          return el >= 0.00 && el <= 1.00;
        }).length === 3;

        if (!valid)
          throw new Error('Settings is invalid.');

        await saveSettings('audio', { bgm, glo, snd }, true);

        return arr;
      } catch (err) { sweet.showValidationMessage('Saving failed: ' + err); }
    },
    showLoaderOnConfirm: true,
    titleText: 'Audio Settings',
  })
  .then(res => {
    if (!res.value) return;

    Howler.volume(res.value[0]);

    const sounds = audioFilter(el => !el.startsWith('bg'));

    for (const sound of sounds)
      audioPool[sound].volume(res.value[1]);

    const bgms = audioFilter(el => el.startsWith('bg'));

    for (const bgm of bgms)
      audioPool[bgm].volume(res.value[2]);

    sweet({
      text: 'Settings saved.',
      type: 'success',
    });
  })
  .catch(err => sweet({
    titleText: err.message,
    type: 'error',
  }));
}

function showVisualSettings () {
  sweet({
    title: 'Coming soon.',
    type: 'error',
  });
}

function showRangeVal (el) {
  const label = $(`#${$(el).attr('id')}-range-val`);
  const title = label.text().split(' - ')[0];

  label.text(`${title} - ${$(el).val()}`);
}
