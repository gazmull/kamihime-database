import SweetAlert2 from 'sweetalert2';
import * as JSCookie from 'js-cookie';
import { IKamihime as IK } from '../../../../typings/index';

declare global {
  var swal: typeof SweetAlert2;
  var sweet: typeof SweetAlert2;
  var Cookies: typeof JSCookie;

  const FG_IMAGE: string;
  const BG_IMAGE: string;
  const SCENARIOS: string;
  const BGM: string;
  const script: IScript[];
  const files: string[];

  var settings: any;
  var audioPool: IHowlPool;

  type APIAction = 'add' | 'update' | 'delete' | 'flag' | 'approve';
  type IKamihime = IK;

  interface IHowlPool {
    [name: string]: Howl;
  }

  interface ISettings {
    audio: {
      bgm: number;
      glo: number;
      snd: number;
    };
    lastNav: string;
    menu: boolean;
    updatedAt: number;
    visual: {
      bg: string;
      cl: string;
      cls: string;
      containDialog: boolean;
      fontSize: number;
    };
  }

  interface IAsset {
    src: string;
    name: string;
    type: 'img' | 'bg' | 'snd' | 'bgm';
    obj?: Howl;
  }

  interface IScript {
    // -- Story
    bg?: string;
    bgm?: string;
    chara?: string;
    expression?: string;
    voice?: string;
    words?: string;

    // -- Scenario
    seconds?: number;
    sequence?: string;
    steps?: number;
    talk?: {
      chara: string;
      voice: string;
      words: string;
    }[];
  }
}
