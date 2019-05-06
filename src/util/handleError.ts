import { Response } from 'express';
import Server from '../struct/server';
import ApiError from './ApiError';

/**
 * [API Exclusive]: Handles the response to error
 * @param res The Response interface
 * @param err The Error interface
 */
export function handleApiError (this: Server, res: Response, err: ApiError) {
  if (err.stack && err.code >= 500) this.util.logger.error(err.stack);

  res
    .status(err.code)
    .json(err.toJSON());
}

/**
 * [Site Exclusive]: Handles the response to error
 * @param res The Response interface
 * @param err The Error interface
 */
export function handleSiteError (this: Server, res: Response, err: ApiError) {
  if (err.stack && err.code >= 500) this.util.logger.error(err.stack);

  res.render('invalids/' + err.code, { message: err.message });
}
