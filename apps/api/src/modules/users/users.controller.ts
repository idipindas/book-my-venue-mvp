import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import type { UpdateProfileDto, ChangePasswordDto } from './users.dto';

export const UsersController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UsersService.getMe(req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UsersService.updateMe(req.user!.id, req.body as UpdateProfileDto);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      await UsersService.changePassword(req.user!.id, req.body as ChangePasswordDto);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },
};
