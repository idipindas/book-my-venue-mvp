import { Request, Response, NextFunction } from 'express';
import { Role } from '../entities/User.entity';
import { AppError } from '../lib/errors';

export function roleGuard(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Not authenticated.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('FORBIDDEN', 'Insufficient permissions.', 403));
    }
    next();
  };
}
