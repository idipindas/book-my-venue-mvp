import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service';

export const PaymentsController = {
  async initiate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PaymentsService.initiate(req.user!.id, req.body.bookingId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PaymentsService.verify(req.user!.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      await PaymentsService.handleWebhook(req.rawBody?.toString() ?? '', signature);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },

  async refund(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PaymentsService.refund(req.user!.id, req.params.bookingId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
