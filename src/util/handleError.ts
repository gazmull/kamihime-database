import { Response } from 'express';

export interface ApiError {
  code: number;
  message: string;
  stack?: string;
}

/**
 * [API Exclusive]: Handles the response to error
 * @param res The Response interface
 * @param err The Error interface
 */
export const handleError: (res: Response, err: ApiError) => void = (res, err) => {
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
