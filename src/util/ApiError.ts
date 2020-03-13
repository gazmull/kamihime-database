import { Util } from 'discord.js';

export default class ApiError extends Error {
  constructor (code = 500, message?: string | string[]) {
    if (!message) message = errors[code];

    super(Util.resolveString(message));

    this.name = this.constructor.name;

    this.code = code;
  }

  public code: number;

  public remaining: number;

  public setRemaining (ms: number) {
    this.remaining = ms;

    return this;
  }

  public toJSON () {
    const obj: { message: string, code: number, remaining?: number } = { message: this.message, code: this.code };

    if (this.remaining) Object.assign(obj, { remaining: this.remaining });

    return { error: obj };
  }
}

const errors = {
  400: 'Bad Request',
  401: 'Unauthorised',
  403: 'Forbidden',
  404: 'Not Found',
  408: 'Request Timeout',
  410: 'Gone',
  411: 'Length Required',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Interval Server Error',
  501: 'Service Unavailable'
};
