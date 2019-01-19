$(() => {
  sweet = sweet.mixin({ heightAuto: false });

  if (!Cookies.getJSON('audio') || !Object.keys(Cookies.getJSON('audio')).length)
    saveSettings('audio', {
      bgm: 0.1,
      glo: 1.0,
      snd: 0.5,
    }, true);

  if (!Cookies.getJSON('visual') || !Object.keys(Cookies.getJSON('visual')).length)
    saveSettings('visual', {
      bg: '#997777',
      cl: '#ffffff',
      cls: '#dd55ff',
      containDialog: true,
      fontSize: 18,
    }, true);

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
      'Additional Help:',
      '<ol style="text-align: justify;">',
      '<li>',
      'You can navigate through the player by:',
      '<br>- Pressing ← and → cursor keys',
      '<br>- Clicking a portion of the image',
      '</li>',
      '<li>Everything is saved if you are logged in, or until you exit your browser as a guest.</li>',
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
        const valid = arr.every(el => el >= 0.00 && el <= 1.00);

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
  const visuals = Cookies.getJSON('visual');
  const divPreviewStyle = [
    `background-image: linear-gradient(to bottom, ${visuals.bg} 1%, transparent 110%)`,
    'color: ' + visuals.cl,
    `text-shadow: ${visuals.cls} 2px 1px`,
  ].join('; ');
  const textPreviewStyle = `font-size: ${visuals.fontSize}px`;
  sweet({
    allowOutsideClick: () => !sweet.isLoading(),
    // tslint:disable:max-line-length
    html: `
          <div id='dialog-preview' style="top: 0; position: relative !important; height: 70px; ${divPreviewStyle}">
            <a id='text-preview' style="text-align: center; ${textPreviewStyle}">Colour Preview Only</a>
          </div>
          <hr>
          <h6>Background Colour - <span id="bg-val">${visuals.bg}</id></h6>
          <input id="bg" type="color" value="${visuals.bg}" onchange="updateDialog('bg', this);">
          <h6>Text Colour - <span id="cl-val">${visuals.cl}</id></h6>
          <input id="cl" type="color" value="${visuals.cl}" onchange="updateDialog('cl', this);">
          <h6>Text Shadow Colour - <span id="cls-val">${visuals.cls}</id></h6>
          <input id="cls" type="color" value="${visuals.cls}" onchange="updateDialog('cls', this);">
          <hr>
          <label><input id="containDialog" type="checkbox"${visuals.containDialog ? ' checked' : ''}> Dialog Within Image</label>
          <br>
          <label>Text Size <input id="fontSize" type="text" value="${visuals.fontSize}" oninput="updateDialog('fontSize', this);"></label>
        `,
      // tslint:enable:max-line-length
    preConfirm: async () => {
      const bg = $('#bg').val();
      const cl = $('#cl').val();
      const cls = $('#cls').val();
      const containDialog = $('#containDialog').is(':checked');
      const fontSize = $('#fontSize').val();
      const arr = [ bg, cl, cls, containDialog, fontSize ];

      if (
        visuals.bg === bg && visuals.cl === cl &&
        visuals.cls === cls && visuals.containDialog === containDialog &&
        visuals.fontSize === fontSize
      )
        throw new Error('Nothing changed.');

      try {
        const valid = arr.slice(0, 3).every(el => /^#\w{6}$/.test(el)) && !isNaN(arr[4]);

        if (!valid)
          throw new Error('Settings is invalid.');

        await saveSettings('visual', { bg, cl, cls, containDialog, fontSize }, true);

        return arr;
      } catch (err) { sweet.showValidationMessage('Saving failed: ' + err); }
    },
    showLoaderOnConfirm: true,
    titleText: 'Visual Settings',
  })
  .then(res => {
    if (!res.value) return;

    [ 'bg', 'cl', 'cls', 'containDialog', 'fontSize' ].forEach((val, idx) => updateDialog(val, res.value[idx], true));

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

function showRangeVal (el) {
  const label = $(`#${$(el).attr('id')}-range-val`);
  const title = label.text().split(' - ')[0];

  label.text(`${title} - ${$(el).val()}`);
}

function updateDialog (type, obj, actual = false) {
  const $this = actual ? obj : $(obj).val();

  if (!actual)
    $(`#${type}-val`).val($this);

  const dialog = actual ? $('#dialog') : $('#dialog-preview');

  switch (type) {
    case 'bg':
      dialog.css('background-image', `linear-gradient(to bottom, ${$this} 1%, transparent 110%)`);
      break;
    case 'cl':
      dialog.css('color', $this);
      break;
    case 'cls':
      dialog.css('text-shadow', $this + ' 2px 1px');
      break;
    case 'containDialog':
      dialog.css('position', $this ? 'absolute' : 'relative');
      break;
    case 'fontSize':
      if (actual) {
        $('#characterName').css('font-size', `${parseInt($this) + 4}px`);
        $('#characterTalk').css('font-size', `${$this}px`);
      } else
        $('#text-preview').css('font-size', `${$this}px`);
      break;
  }
}
