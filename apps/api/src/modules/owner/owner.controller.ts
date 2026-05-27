import { Request, Response, NextFunction } from 'express';
import { OwnerService } from './owner.service';
import { VenueStatus } from '../../entities/Venue.entity';
import type { CreateVenueDto, UpdateVenueDto, SetAvailabilityDto, DeclineBookingDto } from './owner.dto';

export const OwnerController = {
  async createVenue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OwnerService.createVenue(req.user!.id, req.body as CreateVenueDto);
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
};
