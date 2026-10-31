import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors.js';
import type { ApiErrorResponse } from '@repo/shared';
import { config } from '../config.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const payload: ApiErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(payload);
    return;
  }

  // Handle uncaught / unexpected errors
  if (config.NODE_ENV !== 'test') {
    console.error('Unhandled server error:', err);
  }

  const payload: ApiErrorResponse = {
    success: false,
    error: {
      message: config.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      code: 'INTERNAL_SERVER_ERROR',
    },
  };

  res.status(500).json(payload);
}
