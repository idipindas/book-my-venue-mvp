import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { AppError } from '../lib/errors';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 'Missing or invalid authorization header.', 401);
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as { sub: string };

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: payload.sub },
    });
    if (!user) throw new AppError('UNAUTHORIZED', 'User not found.', 401);
    if (user.isSuspended) throw new AppError('FORBIDDEN', 'Account suspended.', 403);

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('UNAUTHORIZED', 'Invalid or expired token.', 401));
  }
}
