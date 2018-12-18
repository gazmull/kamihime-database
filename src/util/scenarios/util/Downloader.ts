import * as fs from 'fs-extra';
import fetch from 'node-fetch';
import { join } from 'path';

export default class Downloader {
  constructor (options: IOptions) {
    this.options = options;
  }

  public options: IOptions;

  /**
   * Downloads the file.
   * @param {boolean} returnData Immediately return the raw data instead.
   * @returns {Promise<FilePath|Buffer>} - path of the downloaded file; if returnData, returns Buffer.
   */
  public async download (returnData = false): Promise<string | Buffer> {
    const url = this.options.url;
    const destDirectory = this.options.destination;
    const filename = this.options.name || this.options.url.split('/').pop();

    if (!url) throw { code: 'NOURI', message: 'No URL provided.' };

    if (!returnData)
      if (!destDirectory) throw { code: 'NODEST', message: 'No Destination Directory provided' };
      else if (!filename) throw { code: 'NONAME', message: 'No file name provided' };
      else if (await Downloader.exists(destDirectory + filename))
        throw { code: 'FEXIST', message: 'File already exists' };

    const data = await fetch(url, { headers: Downloader.headers });
    const file = await data.buffer();

    if (!file || !data.ok)
      throw { code: 'URINOTOK', message: 'Cannot obtain file from the URL' };

    if (returnData)
      return file;

    await fs.outputFile(join(destDirectory, filename), file, 'binary');

    return join(destDirectory, filename);
  }

  public static async exists (filepath): Promise<boolean> {
    try {
      await fs.stat(filepath);

      return true;
    } catch { return false; }
  }

  public static get headers () {
    return {
      'user-agent': [
        'Mozilla/5.0 (Windows NT 6.1; Win64; x64)',
        'AppleWebKit/537.36 (KHTML, like Gecko)',
        'Chrome/58.0.3029.110 Safari/537.36',
      ].join(' '),
    };
  }
}

/**
 * Options for Downloader.
 * @property url URL of the file.
 * @property destination Destination path of the file.
 * @property name File's name to save as.
 */
interface IOptions {
  url: string;
  destination: string;
  name?: string;
}
