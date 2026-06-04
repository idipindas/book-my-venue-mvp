import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/initiate', authMiddleware, PaymentsController.initiate);
router.post('/verify', authMiddleware, PaymentsController.verify);
router.post('/webhook', PaymentsController.webhook);
router.post('/refunds/:bookingId', authMiddleware, PaymentsController.refund);

export default router;
