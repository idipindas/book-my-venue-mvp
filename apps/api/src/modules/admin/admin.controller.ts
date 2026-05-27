import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';

export const AdminController = {
  async getPendingVenues(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await AdminService.getPendingVenues() }); }
    catch (err) { next(err); }
  },

  async approveVenue(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await AdminService.approveVenue(req.params.id) }); }
    catch (err) { next(err); }
  },

  async rejectVenue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.rejectVenue(req.params.id, req.body.note ?? '');
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getAllVenues(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAllVenues(
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async forceDeleteVenue(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.forceDeleteVenue(req.params.id);
      res.json({ success: true, data: null });
    } catch (err) { next(err); }
  },

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAllUsers(
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.suspendUser(req.params.id);
      res.json({ success: true, data: null });
    } catch (err) { next(err); }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteUser(req.params.id);
      res.json({ success: true, data: null });
    } catch (err) { next(err); }
  },

  async getAllBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAllBookings(
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAllPayments(
        parseInt(req.query.page as string) || 1,
        parseInt(req.query.limit as string) || 20
      );
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  },

  async flagPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.flagPayment(req.params.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await AdminService.getPlatformAnalytics() }); }
    catch (err) { next(err); }
  },
};
