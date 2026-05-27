import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RequestHandler } from 'express';

export function validateBody<T extends object>(DtoClass: new () => T): RequestHandler {
  return async (req, res, next) => {
    const dto = plainToInstance(DtoClass, req.body);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: false });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body.',
          details: errors.map((e) => ({
            field: e.property,
            constraints: e.constraints,
          })),
        },
      });
    }
    req.body = dto;
    next();
  };
}
