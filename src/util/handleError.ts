import { Response } from 'express';
import { IErrorHandlerObject } from '../../typings';

/**
 * [API Exclusive]: Handles the response to error
 * @param res The Response interface
 * @param err The Error interface
 */
export function handleApiError (res: Response, err: IErrorHandlerObject) {
  if (err.stack) this.util.logger.error(err.stack);

  if (Array.isArray(err.message)) err.message = err.message.join('\n');
  if (isNaN(err.code))
    res
      .status(500)
      .json({ error: { message: err.message || 'Internal server error.' } });
  else
    res
      .status(err.code)
      .json({ error: err });
}

/**
 * [Site Exclusive]: Handles the response to error
 * @param res The Response interface
 * @param err The Error interface
 */
export function handleSiteError (res: Response, err: IErrorHandlerObject) {
  if (err.stack) this.util.logger.error(err.stack);

  if (Array.isArray(err.message)) err.message = err.message.join('\n');
  if (isNaN(err.code)) res.render('invalids/500', { message: err.message });
  else res.render('invalids/' + err.code, { message: err.message });
}
