import { ErrorRequestHandler } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, statusCode: err.statusCode },
    });
  }

  if (err.name === 'QueryFailedError') {
    return res.status(400).json({
      success: false,
      error: { code: 'DB_ERROR', message: 'Database operation failed.', statusCode: 400 },
    });
  }

  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.', statusCode: 500 },
  });
};
