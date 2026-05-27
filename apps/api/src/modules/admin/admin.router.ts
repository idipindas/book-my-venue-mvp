import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleGuard } from '../../middleware/role.middleware';
import { Role } from '../../entities/User.entity';

const router = Router();

router.use(authMiddleware, roleGuard(Role.ADMIN));

router.get('/venues/pending', AdminController.getPendingVenues);
router.patch('/venues/:id/approve', AdminController.approveVenue);
router.patch('/venues/:id/reject', AdminController.rejectVenue);
router.get('/venues', AdminController.getAllVenues);
router.delete('/venues/:id', AdminController.forceDeleteVenue);

router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/suspend', AdminController.suspendUser);
router.delete('/users/:id', AdminController.deleteUser);

router.get('/bookings', AdminController.getAllBookings);

router.get('/payments', AdminController.getAllPayments);
router.patch('/payments/:id/flag', AdminController.flagPayment);

router.get('/analytics', AdminController.getAnalytics);

export default router;
