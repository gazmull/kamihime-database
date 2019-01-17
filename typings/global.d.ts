import { Api as ApiAuth, DiscordClient, GrantProvider, Host } from 'auth';
import { Request, Response } from 'express';
import { Message, Collection } from 'discord.js';
import * as Knex from 'knex';
import Server from '../src/struct/Server';

declare global {
  interface IApiOptions {
    cooldown?: number;
    max?: number;
    method: string;
  }

  interface IRouteOptions {
    auth?: boolean | 'required';
    id?: string;
    method?: string;
    route?: string[];
  }

  interface IAuth {
    api: ApiAuth;
    database: Knex.Config;
    discord: GrantProvider;
    exempt: string[];
    host: Host;
    rootURL: string;
  }

  interface IClientAuth {
    discord: DiscordClient;
  }

  interface IUtil {
    collection?: () => Collection<any, any>;
    db?: Knex;
    discordSend?: (channelId: string, message: any) => Promise<Message | Message[]>;
    handleApiError?: (res: Response, err: IErrorHandlerObject) => void;
    handleSiteError?: (res: Response, err: IErrorHandlerObject) => void;
    logger?: {
      status: (message: string) => void;
      error: (message: string) => void;
      warn: (message: string) => void;
    };
  }

  interface IErrorHandlerObject {
    code: number;
    message?: string|string[];
    stack?: string;
  }

  interface IExtractorOptions {
    base: {
      CHARACTERS: any[];
      DESTINATION: string;
      URL: { SCENARIOS: string };
    };
    codes: {
      [type: string]: {
        get: string;
        intro: string;
        scene: string;
      },
    };
  }
  
  interface IExtractorFiles {
    [key: string]: {
      [key: string]: string[],
    };
  }
  
  interface IScenarioSequence {
    auto?: boolean;
    bgm: string;
    film: string;
    fps?: number;
    talk: Array<{
      chara: string;
      voice: string;
      words: string;
    }>;
  }

  interface IUser {
    lastLogin: string;
    settings?: string;
    userId: string;
    username?: string;
  }

  interface IAdminUser extends IUser {
    ip: string;
    password: string;
    slug: string;
  }

  interface IKamihime {
    _rowId: number;
    approved: number;
    avatar: string;
    element?: string;
    harem1Resource1?: string;
    harem1Resource2?: string;
    harem1Title?: string;
    harem2Resource1?: string;
    harem2Resource2?: string;
    harem2Title?: string;
    harem3Resource1?: string;
    harem3Resource2?: string;
    harem3Title?: string;
    id: string;
    loli: number;
    main: string;
    name: string;
    peeks?: number;
    preview?: string;
    rarity?: string;
    tier?: string;
    type?: string;
  }

  interface IRateLimitLog {
    address: string;
    timestamp: number;
    triggers: number;
  }

  interface IReport {
    characterId: string;
    date: string;
    id: number;
    message: string;
    type: number;
    userId: string;
  }

  interface ISession {
    characterId: string;
    created: string;
    id: string;
    password: string;
    userId: string;
  }

  interface IState {
    timestamp: number;
    url: string
  }

  interface IStatus {
    date: string;
    id: string;
    message: string;
  }
}
