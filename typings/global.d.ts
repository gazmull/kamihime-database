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
    id: string;
    method: string;
    route: string[];
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
    handleApiError?: (res: Response, err: IErrorHandlerObject) => void;
    handleSiteError?: (res: Response, err: IErrorHandlerObject) => void;
    logger?: {
      status: (message: string) => void;
      error: (message: string) => void;
      warn: (message: string) => void;
    };
    discordSend?: (channel: string, message: any) => Promise<Message | Message[]>;
  }

  interface IErrorHandlerObject {
    code: number;
    message?: string|string[];
    stack?: string;
  }

  interface IExtractorOptions {
    base: {
      URL: {
        SCENARIOS: string;
      };
      DESTINATION: string;
      CHARACTERS: any[];
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
    fps?: number;
    auto?: boolean;
    film: string;
    bgm: string;
    talk: Array<{
      chara: string;
      words: string;
      voice: string;
    }>;
  }

  interface IUser {
    userId: string;
    username?: string;
    expiration?: string;
    refreshToken?: string;
    settings?: string;
    lastLogin: string;
  }

  interface IAdminUser extends IUser {
    slug: string;
  }

  interface IKamihime {
    _rowId: number;
    id: string;
    name: string;
    approved: number;
    avatar: string;
    main: string;
    preview?: string;
    loli: number;
    peeks?: number;
    harem1Title?: string;
    harem1Resource1?: string;
    harem1Resource2?: string;
    harem2Title?: string;
    harem2Resource1?: string;
    harem2Resource2?: string;
    harem3Title?: string;
    harem3Resource1?: string;
    harem3Resource2?: string;
    element?: string;
    type?: string;
    rarity?: string;
    tier?: string;
  }

  interface IReport {
    id: number;
    userId: string;
    characterId: string;
    type: number;
    message: string;
    date: string;
  }

  interface ISession {
    id: string;
    password: string;
    created: string;
    characterId: string;
    userId: string;
  }

  interface IStatus {
    id: string;
    date: string;
    message: string;
  }
}
