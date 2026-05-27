import { Router } from 'express';
import authRouter from '../modules/auth/auth.router';
import usersRouter from '../modules/users/users.router';
import venuesRouter from '../modules/venues/venues.router';
import bookingsRouter from '../modules/bookings/bookings.router';
import paymentsRouter from '../modules/payments/payments.router';
import ownerRouter from '../modules/owner/owner.router';
import adminRouter from '../modules/admin/admin.router';
import mediaRouter from '../modules/media/media.router';
import notificationsRouter from '../modules/notifications/notifications.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/venues', venuesRouter);
router.use('/bookings', bookingsRouter);
router.use('/payments', paymentsRouter);
router.use('/owner', ownerRouter);
router.use('/admin', adminRouter);
router.use('/media', mediaRouter);
router.use('/notifications', notificationsRouter);

export default router;
