import { Api as ApiAuth, DiscordClient, GrantProvider, Host } from './auth';
import { Collection, Message } from 'discord.js';
import { Response } from 'express';
import * as Knex from 'knex';
import { Logger } from 'winston';

export interface IRouteOptions {
  auth?: boolean | 'admin';
  id: string;
  method: string;
  route: string[];
}

export interface IApiOptions extends IRouteOptions {
  cooldown: number;
  max: number;
}

export interface IAuth {
  api: ApiAuth;
  database: Knex.Config;
  discord: GrantProvider;
  exempt: string[];
  host: Host;
  rootURL: string;
}

export interface IClientAuth {
  discord: DiscordClient;
}

export interface IUtil {
  collection?: () => Collection<any, any>;
  db?: Knex;
  discordSend?: (channelId: string, message: any) => Logger | Promise<Message | Message[]>;
  handleApiError?: (res: Response, err: IErrorHandlerObject) => void;
  handleSiteError?: (res: Response, err: IErrorHandlerObject) => void;
  logger?: Logger
}

export interface IErrorHandlerObject {
  code: number;
  message?: string|string[];
  stack?: string;
}

export interface IExtractorOptions {
  logger: Logger;
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

export interface IExtractorFiles {
  [key: string]: {
    [key: string]: string[],
  };
}

export interface IScenarioSequence {
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

export interface IUser {
  lastLogin: string;
  settings?: string;
  userId: string;
  username?: string;
}

export interface IAdminUser extends IUser {
  ip: string;
  password: string;
  slug: string;
  _iterations: number,
  _salt: string,
}

export interface IKamihime {
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

export interface IRateLimitLog {
  address: string;
  timestamp: number;
  triggers: number;
}

export interface IReport {
  characterId: string;
  date: string;
  id: number;
  message: string;
  type: number;
  userId: string;
}

export interface ISession {
  characterId: string;
  created: string;
  id: string;
  password: string;
  userId: string;
}

export interface IState {
  timestamp: number;
  url: string
}

export interface IPasswordAttempts {
  attempts: number;
}

export interface IStatus {
  date: string;
  id: string;
  message: string;
}
