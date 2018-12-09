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
  if (Array.isArray(err.message)) err.message = err.message.join('\n');
  if (isNaN(err.code))
    res
      .status(500)
      .json({ error: { message: err.message || 'Internal server error.' } });
  else
    res
      .status(err.code)
      .json({ error: err });

  if (err.stack) console.log(err.stack);
};

/**
 * [Site Exclusive]: Handles the response to error
 * @param res The Response interface
 * @param err The Error interface
 */
export const handleSiteError: (res: Response, err: ErrorHandlerObject) => void = (res, err) => {
  if (Array.isArray(err.message)) err.message = err.message.join('<br>');
  if (isNaN(err.code)) res.render('invalids/500');
  else res.render('invalids/' + err.code, { message: err.message }, err => {
    if (err)
      res.render('invalids/500');
  });

  if (err.stack) console.log(err.stack);
};
