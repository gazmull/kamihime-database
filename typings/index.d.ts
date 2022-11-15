import { Collection, Message } from 'discord.js';
import { Response } from 'express';
import { Knex } from 'knex';
import { Logger } from 'winston';
import apiHandler from '../src/middleware/api-handler';
import reAuthHandler from '../src/middleware/re-auth-handler';
import Client from '../src/struct/Client';
import ApiError from '../src/util/ApiError';
import { Api as ApiAuth, DiscordClient, DiscordGrant, Host, URLS, Directories } from './auth';

export interface IRouterData {
  directory: string;
  routes: string[];
  client: Client;
  handler?: typeof reAuthHandler | typeof apiHandler;
}

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
  discord: DiscordGrant;
  exempt: string[];
  host: Host;
  urls: URLS;
  dirs: Directories;
}

export interface IClientAuth {
  discord: DiscordClient;
}

export interface IUtil {
  collection?: <K, V>() => Collection<K, V>;
  db?: Knex;
  discordSend?: (channelId: string, message: any) => Logger | Promise<Message | Message[]>;
  handleApiError?: (res: Response, err: ApiError) => void;
  handleSiteError?: (res: Response, err: ApiError) => void;
  logger?: Logger
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

export interface IApiError {
  message?: string;
  code?: number;
}

export interface IKamihime {
  _rowId?: number;
  approved?: number;
  avatar?: string;
  element?: string;
  harem1Resource1?: string;
  harem1Title?: string;
  harem2Resource1?: string;
  harem2Resource2?: string;
  harem2Title?: string;
  harem3Resource1?: string;
  harem3Resource2?: string;
  harem3Title?: string;
  id?: string;
  loli?: number;
  main?: string;
  name?: string;
  peeks?: number;
  preview?: string;
  rarity?: string;
  tier?: string;
  type?: string;
  atk?: number;
  hp?: number;
  created?: string;
  mUpdated?: string;
}

export interface IKamihimeWiki {
  name?: string;
  type?: string;
  tier?: string;
  rarity?: string;
  element?: string;
  hp_max?: number;
  atk_max?: number;
}

export interface IKamihimeLatest {
  error?: IApiError;
  soul?: IKamihime[];
  eidolon?: IKamihime[];
  'ssr+'?: IKamihime[];
  ssr?: IKamihime[];
  sr?: IKamihime[];
  r?: IKamihime[];
  skin?: IKamihime[];
}

export type IScript = { scenario: any };

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
