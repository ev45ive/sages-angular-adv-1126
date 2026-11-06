import type { Request, Response, NextFunction } from 'express';
import type { ApiError } from '../types.js';

/**
 * Global Express error handler.
 * Transforms unhandled errors into the standard ApiError shape.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Error]', err.message);

  const body: ApiError = {
    error: {
      status: 500,
      message: err.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  };

  res.status(500).json(body);
}
