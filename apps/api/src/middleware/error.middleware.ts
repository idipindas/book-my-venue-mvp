import { ErrorRequestHandler } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, url: req.url, method: req.method }, err.message);
    } else {
      logger.warn({ code: err.code, url: req.url, method: req.method }, err.message);
    }
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, statusCode: err.statusCode },
    });
  }

  if (err.name === 'QueryFailedError') {
    logger.error({ err, url: req.url, method: req.method }, 'Database query failed');
    return res.status(400).json({
      success: false,
      error: { code: 'DB_ERROR', message: 'Database operation failed.', statusCode: 400 },
    });
  }

  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.', statusCode: 500 },
  });
};
