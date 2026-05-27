import { Request, Response, NextFunction } from 'express';
import { BookingsService } from './bookings.service';
import type { CreateBookingDto } from './bookings.dto';

export const BookingsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BookingsService.create(req.user!.id, req.body as CreateBookingDto);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BookingsService.findAll(req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BookingsService.findById(req.params.id, req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BookingsService.cancel(req.params.id, req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
