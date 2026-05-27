import { Request, Response, NextFunction } from 'express';
import { VenueService } from './venues.service';
import { VenueType } from '../../entities/Venue.entity';

export const VenueController = {
  async getNearby(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat((req.query.radius as string) ?? '10');
      const data = await VenueService.findNearby(lat, lng, radius);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      const data = await VenueService.search(q ?? '');
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await VenueService.findAll({
        type: req.query.type as VenueType,
        minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity as string) : undefined,
        maxCapacity: req.query.maxCapacity ? parseInt(req.query.maxCapacity as string) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        date: req.query.date as string,
        city: req.query.city as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VenueService.findById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VenueService.getAvailability(
        req.params.id,
        req.query.date as string
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
