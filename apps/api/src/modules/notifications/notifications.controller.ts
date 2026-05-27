import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';

export const NotificationsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NotificationsService.findAll(
        req.user!.id,
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NotificationsService.markRead(req.params.id, req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.markAllRead(req.user!.id);
      res.json({ success: true, data: null });
    } catch (err) { next(err); }
  },
};
