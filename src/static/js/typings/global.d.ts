import SweetAlert2 from 'sweetalert2';
import * as JSCookie from 'js-cookie';
import { IKamihime as IK } from '../../../../typings/index';
import { ModalEventHandler as meh} from 'bootstrap';

declare global {
  var swal: typeof SweetAlert2;
  var sweet: typeof SweetAlert2;
  var Cookies: typeof JSCookie;
  type ModalEventHandler = meh<HTMLElement>;

  const MISC: string;
  const SCENARIOS: string;
  let script: IScript[];
  const files: string[];

  var settings: ISettings;
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
    menu: boolean;
    updatedAt: number;
    visual: {
      bg: string;
      cl: string;
      cls: string;
      containDialog: boolean;
      name: string;
      autoDialog: boolean;
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

  interface IAnimation {
    'animation-name'?: string | 'play';
    'animation-delay'?: string | '0.1s';
    'animation-duration'?: string;
    'animation-iteration-count'?: string | 'infinite';
    'animation-timing-function'?: string;
    display?: '';
  }
}
