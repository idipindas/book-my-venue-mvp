import { Request, Response, NextFunction } from 'express';
import { OwnerService } from './owner.service';
import { VenueStatus } from '../../entities/Venue.entity';
import type { CreateVenueDto, UpdateVenueDto, SetAvailabilityDto, DeclineBookingDto } from './owner.dto';

export const OwnerController = {
  async createVenue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.createVenue(
        req.user!.id,
        req.body as CreateVenueDto,
        (req.files as Express.Multer.File[]) ?? [],
      );
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getMyVenues(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.getMyVenues(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getMyVenueById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.getMyVenueById(req.user!.id, req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async updateVenue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.updateVenue(req.user!.id, req.params.id, req.body as UpdateVenueDto);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async setVenueStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.setVenueStatus(req.user!.id, req.params.id, req.body.status as VenueStatus);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async deleteVenue(req: Request, res: Response, next: NextFunction) {
    try {
      await OwnerService.deleteVenue(req.user!.id, req.params.id);
      res.json({ success: true, data: null });
    } catch (err) { next(err); }
  },

  async setAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.setAvailability(req.user!.id, req.params.id, req.body as SetAvailabilityDto);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getIncomingBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.getIncomingBookings(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.getBookingById(req.user!.id, req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async acceptBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.acceptBooking(req.user!.id, req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async declineBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.declineBooking(req.user!.id, req.params.id, (req.body as DeclineBookingDto).reason);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.getAnalytics(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async uploadVenuePhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      const data = await OwnerService.uploadVenuePhotos(req.user!.id, req.params.id, files ?? []);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async deleteVenuePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { url } = req.body as { url: string };
      if (!url)
        return res.status(400).json({ success: false, error: { code: 'MISSING_URL', message: 'url is required.' } });
      const data = await OwnerService.deleteVenuePhoto(req.user!.id, req.params.id, url);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async reorderVenuePhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body as { ids: string[] };
      if (!Array.isArray(ids))
        return res.status(400).json({ success: false, error: { code: 'INVALID_BODY', message: 'ids must be an array of photo IDs.' } });
      const data = await OwnerService.reorderVenuePhotos(req.user!.id, req.params.id, ids);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
