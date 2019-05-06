$(() => sweet = sweet.mixin({ heightAuto: false }));

audioPool = {};
const audioFilter = (fn: (el: string) => boolean) => Object.keys(audioPool).filter(fn);

// @ts-ignore
function showHelp () {
  return sweet.fire({
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
    titleText: 'Player Settings'
  });
}

async function showAudioSettings () {
  const snd1 = audioPool[audioFilter(el => !el.startsWith('bg'))[0]];
  const bgm1 = audioPool[audioFilter(el => el.startsWith('bg'))[0]];

  try {
    const res = await sweet.fire({
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
      titleText: 'Audio Settings'
    });

    if (!res.value) return;
    if ([ 'iPhone', 'iPad', 'iPhone' ].some(el => new RegExp(el, 'i').test(navigator.userAgent)))
      return sweet.fire('iOS Detected', 'This action requires the page to reload. Are you sure?', 'question')
        .then(r => r.dismiss ? undefined : window.location.reload());

    Howler.volume(res.value[0]);

    const sounds = audioFilter(el => !el.startsWith('bg'));

    for (const sound of sounds)
      audioPool[sound].volume(res.value[1]);

    const bgms = audioFilter(el => el.startsWith('bg'));

    for (const bgm of bgms)
      audioPool[bgm].volume(res.value[2]);

    return sweet.fire({ text: 'Settings saved.' });
  } catch (err) {
    return sweet.fire({ titleText: err.message });
  }
}

async function showVisualSettings () {
  const visuals = settings.visual;
  const divPreviewStyle = [
    `background-image: linear-gradient(to bottom, ${visuals.bg} 1%, transparent 110%)`,
    'color: ' + visuals.cl,
    `text-shadow: ${visuals.cls} 2px 1px`,
  ].join('; ');
  const textPreviewStyle = `font-size: ${visuals.fontSize}px`;

  try {
    const res = await sweet.fire({
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
          const valid = arr.slice(0, 3).every(el => /^#\w{6}$/.test(el as string)) && !isNaN(arr[4] as number);

          if (!valid)
            throw new Error('Settings is invalid.');

          await saveSettings('visual', { bg, cl, cls, containDialog, fontSize }, true);

          return arr;
        } catch (err) { sweet.showValidationMessage('Saving failed: ' + err); }
      },
      showLoaderOnConfirm: true,
      titleText: 'Visual Settings'
    });

    if (!res.value) return;

    [ 'bg', 'cl', 'cls', 'containDialog', 'fontSize' ].forEach((val, idx) => updateDialog(val, res.value[idx], true));

    return sweet.fire({ text: 'Settings saved.' });
  } catch (err) {
    return sweet.fire({ text: err.message });
  }
}

function showRangeVal (el: string) {
  const label = $(`#${$(el).attr('id')}-range-val`);
  const title = label.text().split(' - ')[0];

  label.text(`${title} - ${$(el).val()}`);
}

function updateDialog (type: string, obj: string, actual = false) {
  const $this = actual ? obj : $(obj).val() as string;

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
      dialog.css('transform', $this ? '' : 'translateY(100%)');

      if (actual) $('footer').css('visibility', $this ? '' : 'hidden');
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

async function loadAssets (assets: IAsset[], opt?: { withSound?: boolean, updateVisuals?: boolean }) {
  if (opt.withSound) Howler.volume(settings.audio.glo !== undefined ? settings.audio.glo : 1.0);
  if (opt.updateVisuals)
    for (const vSetting of [ 'bg', 'cl', 'cls', 'containDialog', 'fontSize' ])
      updateDialog(vSetting, settings.visual[vSetting], true);

  const load: (_asset: IAsset) => Promise<IAsset> = ({ src, name, type }) =>
    new Promise((resolve, reject) => {
      const isBGM = type === 'bgm';
      const asset: HTMLImageElement | Howl = type === 'img' || type === 'bg'
        ? new Image()
        : new Howl({
          loop: isBGM ? true : false,
          onload: () => resolve({ obj: asset as Howl, src, name, type }),
          onloaderror: (_, err) => reject(new Error(err + ` [type: ${type}, name: ${name}]`)),
          preload: true,
          src: [ src ],
          volume: isBGM
            ? (settings.audio.bgm !== undefined ? settings.audio.bgm : 0.10)
            : (settings.audio.snd !== undefined ? settings.audio.snd : 0.50)
        });

      if (type === 'img' || type === 'bg') {
        (asset as HTMLImageElement).src = src;
        (asset as HTMLImageElement).onload = () => resolve({ src, name, type });
        (asset as HTMLImageElement).onerror = () => reject(new Error('URL does not return OK status: ' + src));
      }
    });

  return Promise.all(assets.map(load));
}

function serialiseAnimation (animation: IAnimation, { fading = false, seconds, steps }: { seconds?: number, steps?: number, fading?: boolean }) {
  const standard = Object.assign({}, animation);

  if (fading)
    Object.assign(standard, {
      'animation-name': 'fade',
      'animation-delay': '',
      'animation-duration': '1s',
      'animation-iteration-count': '',
      'animation-timing-function': '',
    });
  else
    Object.assign(standard, {
      'animation-duration': `${seconds}s`,
      'animation-timing-function': `steps(${steps})`
    });

  const webkit = {};

  for (const a of Object.keys(standard)) {
    if (!a.startsWith('animation')) continue;

    webkit[`-webkit-${a}`] = standard[a];
  }

  return { ...webkit, ...standard };
}
