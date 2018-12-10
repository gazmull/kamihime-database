import { Response } from 'express';

export interface ErrorHandlerObject {
  code: number;
  message?: string|string[];
  stack?: string;
}

/**
 * [API Exclusive]: Handles the response to error
 * @param res The Response interface
 * @param err The Error interface
 */
export const handleApiError: (res: Response, err: ErrorHandlerObject) => void = (res, err) => {
  if (err.stack) console.log(err.stack);

  if (Array.isArray(err.message)) err.message = err.message.join('\n');
  if (isNaN(err.code))
    res
      .status(500)
      .json({ error: { message: err.message || 'Internal server error.' } });
  else
    res
      .status(err.code)
      .json({ error: err });
};

/**
 * [Site Exclusive]: Handles the response to error
 * @param res The Response interface
 * @param err The Error interface
 */
export const handleSiteError: (res: Response, err: ErrorHandlerObject) => void = (res, err) => {
  if (err.stack) console.log(err.stack);

  if (Array.isArray(err.message)) err.message = err.message.join('\n');
  if (isNaN(err.code)) res.render('invalids/500', { message: err.message });
  else res.render('invalids/' + err.code, { message: err.message });
};
