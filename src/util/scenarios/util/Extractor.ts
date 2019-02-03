import * as fs from 'fs-extra';
import fetch from 'node-fetch';
import { status, warn } from '../../console';
import GithubGist from './GithubGist';

const formatErr = (message: string) => `${new Date().toLocaleString()}: ${message}`;

const headers = {
  'user-agent': [
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64)',
    'AppleWebKit/537.36 (KHTML, like Gecko)',
    'Chrome/58.0.3029.110 Safari/537.36',
  ].join(' '),
};

export default class Extractor {
  constructor (options: IExtractorOptions) {
    this.base = options.base;

    this.codes = options.codes;

    this.files = {};

    this.blacklist = [];

    this.resourcesExtracted = 0;

    this.resourcesFound = 0;

    this.filesFound = 0;

    this.errors = [];

    this.verbose = process.argv.includes('--verbose');
  }

  public base: IExtractorOptions['base'];
  public codes: IExtractorOptions['codes'];
  public files: IExtractorFiles;
  public blacklist: string[];
  public resourcesExtracted: number;
  public resourcesFound: number;
  public filesFound: number;
  public errors: string[];
  public verbose: boolean;

  public async exec (): Promise<boolean> {
    for (const character of this.base.CHARACTERS) {
      const { id, ..._resources } = character;
      const resources = this._filter(_resources, el => el);

      if (!this.files[id])
        this.files[id] = {};

      this.resourcesFound += Object.keys(resources).length;
      this.resourcesExtracted += await this._extract(id, resources);
    }

    this.blacklist = await GithubGist();

    await this._download();

    if (this.errors.length)
      await fs.outputFile(
        process.cwd() + '/scenarios-error.log',
        this.errors.join('\r\n').replace(/\n/g, '\n'),
      );

    status([
      `Extracted ${this.resourcesExtracted} resources. (Expected: ${this.resourcesFound})`,
      `Files Found: ${this.filesFound}`,
      this.errors.length
        ? [
          'I have detected some errors during the process.',
          `Error log can be found at ${process.cwd()}\\scenarios-error.log`,
        ].join('\n')
        : '',
    ].join('\n'));

    return true;
  }

  // -- Utils

  private async _download (): Promise<boolean> {
    for (const chara in this.files) {
      if (!this.files[chara]) continue;

      const resourceDirectories = this.files[chara];

      if (this.verbose) warn(`Extracting resource assets for ${chara}...`);

      for (const resourceDirectory in resourceDirectories) {
        if (!resourceDirectories[resourceDirectory]) continue;

        const files = resourceDirectories[resourceDirectory];
        const _files: string[] = [];
        this.filesFound += files.length;

        if (this.verbose) warn(`Extracting ${resourceDirectory} assets...`);

        for (const file of files) {
          if (!file) continue;
          else if (this.blacklist.includes(file)) continue;

          _files.push(file);
        }

        try {
          await fs.outputFile(this.base.DESTINATION + `/${chara}/${resourceDirectory}/files.rsc`, _files.join(','));
        } catch (err) {
          this.errors.push(formatErr(`[${chara}] [${resourceDirectory}]\n ${err.stack}`));

          if (this.verbose) warn(`Failed extracting ${resourceDirectory} assets see scenario-error.log...`);
        }
      }

      if (this.verbose) status(`Finished extracting resource assets for ${chara}`);
    }

    return true;
  }

  private async _extract (id: string, resources: { [column: string]: string}): Promise<number> {
    let extracted = Object.keys(resources).length;

    for (const r in resources) {
      // tslint:disable-next-line:forin
      // tf...
      if (!resources[r]) {
        extracted--;

        continue;
      }

      if (this.verbose) warn(`Extracting ${id} resource script ${resources[r]}...`);

      const resource = resources[r];
      const prefix = id.charAt(0);
      const type = this.codes[prefix];
      const foldersFlat = Object.values(type).map(el => el.split('/').join(''));
      const resourceLastFour = resource.slice(-4);
      const file = foldersFlat.filter(el => el !== type.scene.split('/').join('')).includes(resourceLastFour)
        ? '/scenario/first.ks'
        : '/scenario.json';
      let folder = foldersFlat.find(el => el === resourceLastFour);

      try {
        if (!folder)
          throw new Error([
            'Cannot resolve resource parent folder.',
            'Looks like wrong resource directory for this character.',
          ].join(' '));

        const fLen = folder.length / 2;
        folder = `${folder.slice(0, fLen)}/${folder.slice(fLen)}/`;

        const data = await fetch(this.base.URL.SCENARIOS + folder + resource + file, { headers });
        const script = await data.text();

        if (!data.ok || !script) {
          if (this.verbose)
            warn(`Failed to download ${file} for ${resource} (${this.base.URL.SCENARIOS + folder + resource + file})`);

          throw new Error(data.status + `: ${data.statusText}`);
        }

        if (file === '/scenario/first.ks')
          await this._doStory({
            id,
            resource,
            script,
            type,
          });
        else {
          const mainData = script
            .replace(/(.*?),\s*(\}|])/g, '$1$2')
            .replace(/;\s*?$/, '')
            .replace(/”(?!(?:.+)?")/g, '"');
          const json: IScenarioSequence[] = JSON.parse(mainData);

          await this._doScenario({
            id,
            resource,
            type,
            script: json,
          });
        }

        status(`Extracted ${id} resource script ${resource}`);
      } catch (err) {
        extracted--;
        this.errors.push(formatErr(`[${id}] [${resource}]\n ${err.stack}`));

        if (this.verbose) warn(`Failed extracting ${resource} see scenario-error.log...`);
      }
    }

    return extracted;
  }

  private async _doStory (
    { id, resource, script, type }:
    { id: string, resource: string, script: string, type: IExtractorOptions['codes']['type'] },
  ): Promise<boolean> {
    const chara = {};
    let lines = [];
    let name;

    if (!this.files[id][resource])
      this.files[id][resource] = [];

    const entries = script
      .replace(/\]\[/, ']\n[')
      .split('\n');

    for (const entry of entries) {
      const miscChar = [ '*', '#', 'Tap to continue' ].some(i => entry.startsWith(i));

      if (miscChar) continue;
      if (entry.startsWith('[')) {
        const attributes = entry
          .replace(/[[\]"]/g, '')
          .split(' ');

        if (attributes.length < 2) continue;

        const attribute: any = { command: attributes.shift() };

        for (const field of attributes) {
          const parsedField = field.split('=');
          const [ command, value ] = parsedField;

          if (parsedField.length === 2) attribute[command] = value;
        }

        switch (attribute.command) {
          case 'chara_new': {
            this.files[id][resource].push(attribute.storage);
            Object.assign(chara, { [attribute.name]: { name: attribute.jname } });
            break;
          }

          case 'chara_face': {
            this.files[id][resource].push(attribute.storage);

            if (!chara[attribute.name].face)
              Object.assign(chara[attribute.name], { face: {} });

            Object.assign(chara[attribute.name].face, { [attribute.face]: attribute.storage });
            break;
          }

          case 'playbgm': {
            this.files[id][resource].push(attribute.storage);
            lines.push({ bgm: attribute.storage });
            break;
          }

          case 'bg': {
            const irrBG = [ 'white', 'black', 'tomei' ].some(i => attribute.storage && attribute.storage.startsWith(i));

            if (irrBG) continue;

            this.files[id][resource].push(attribute.storage);
            lines.push({ bg: attribute.storage });
            break;
          }

          case 'chara_show': {
            name = chara[attribute.name].name;
            break;
          }

          case 'chara_mod': {
            lines.push({ expression: chara[attribute.name].face[attribute.face] });
            break;
          }

          case 'playse': {
            const isGetIntro = [ 'h_get', 'h_intro' ].some(i => attribute.storage && attribute.storage.startsWith(i));

            if (!isGetIntro) continue;

            this.files[id][resource].push(attribute.storage);
            lines.push({ voice: attribute.storage });
            break;
          }

          case 'chara_hide': {
            name = ' ';
            break;
          }
        }
      } else {
        const text = entry
          .replace(/(["%])/g, '\\$&')
          .replace(/\[l\]|\[r\]|\[cm\]|^;.+/g, '')
          .replace(/(\.{1,3})(?=[^\s\W])/g, '$& ')
          .replace(/&nbsp;/gi, ' ');
        const invalidTalk = (text.replace(/ /g, '')).length < 2;

        if (invalidTalk) continue;

        lines.push({ chara: name ? name.replace(/&nbsp;/gi, ' ') : name, words: text });
      }
    }

    const tmp = lines;
    let sequence: any = {};
    let lastBG = null;
    let lastBGM = null;
    lines = [];

    for (const entry of tmp) {
      const key = Object.keys(entry)[0];

      if (key === 'chara')
        Object.assign(sequence, { chara: entry.chara, words: entry.words });
      else {
        Object.assign(sequence, { [key]: entry[key] });

        if (key === 'bg')
          lastBG = entry[key];

        if (key === 'bgm')
          lastBGM = entry[key];
      }

      if (!sequence.bg)
        Object.assign(sequence, { bg: lastBG });

      if (!sequence.bgm)
        Object.assign(sequence, { bgm: lastBGM });

      if (sequence.chara) {
        sequence.chara = sequence.chara.replace(/[ ]/g, ' ');

        lines.push(sequence);

        sequence = {};
      }
    }

    await fs.outputJSON(
      this.base.DESTINATION + `/${id}/${resource}/script.json`,
      { scenario: lines },
      { spaces: 2 },
    );

    return true;
  }

  private async _doScenario (
    { id, resource, script, type }:
    { id: string, resource: string, script: IScenarioSequence[], type: IExtractorOptions['codes']['type'] },
  ): Promise<boolean> {
    const lines = [];

    if (!this.files[id][resource])
      this.files[id][resource] = [];

    for (const entry of script) {
      const entryData = {};

      if (entry.bgm) {
        this.files[id][resource].push(entry.bgm);

        Object.assign(entryData, { bgm: entry.bgm });
      }

      if (entry.film) {
        this.files[id][resource].push(entry.film);

        const fps = Number(entry.fps);

        Object.assign(entryData, {
          seconds: fps === 1 || fps === 16 ? 1 : fps === 24 ? '0.67' : 2,
          sequence: entry.film,
          steps: fps === 1 ? 1 : 16,
        });
      }

      const talkData = [];

      for (const line of entry.talk) {
        const talkEntry = {};

        if (line.hasOwnProperty('voice')) {
          this.files[id][resource].push(line.voice);

          if (line.voice.length)
            Object.assign(talkEntry, { voice: line.voice });
        }

        line.words = line.words
          .replace(/[[\]"]/g, '')
          .replace(/(\.{1,3}|…|,)(?=[^\s\W])/g, '$& ');
        line.chara = line.chara
          .replace(/(["%])/g, '\\$&');

        Object.assign(talkEntry, { chara: line.chara, words: line.words });

        const dataMax = script.length - 1;
        const lineMax = entry.talk.length - 1;

        if (script.indexOf(entry) === dataMax && entry.talk.indexOf(line) === lineMax)
          Object.assign(talkEntry, { toIndex: true });

        talkData.push(talkEntry);
      }

      Object.assign(entryData, { talk: talkData });

      lines.push(entryData);
    }

    await fs.outputJSON(
      this.base.DESTINATION + `/${id}/${resource}/script.json`,
      { scenario: lines },
      { spaces: 2 },
    );

    return true;
  }

  /**
   * Filters an object.
   * @param obj Object to filter
   * @param fn Function to use as filter
   */
  public _filter (obj: object, fn: (el: any) => any): any {
    return Object.keys(obj)
      .filter(el => fn(obj[el]))
      .reduce((prev, cur) => Object.assign(prev, { [cur]: obj[cur] }), {});
  }
}
