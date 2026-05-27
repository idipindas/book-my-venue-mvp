import { Router } from 'express';
import { OwnerController } from './owner.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleGuard } from '../../middleware/role.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { CreateVenueDto, UpdateVenueDto, SetAvailabilityDto, DeclineBookingDto } from './owner.dto';
import { Role } from '../../entities/User.entity';

const router = Router();

router.use(authMiddleware, roleGuard(Role.OWNER, Role.ADMIN));

router.post('/venues', validateBody(CreateVenueDto), OwnerController.createVenue);
router.get('/venues', OwnerController.getMyVenues);
router.get('/venues/:id', OwnerController.getMyVenueById);
router.put('/venues/:id', validateBody(UpdateVenueDto), OwnerController.updateVenue);
router.patch('/venues/:id/status', OwnerController.setVenueStatus);
router.delete('/venues/:id', OwnerController.deleteVenue);
router.put('/venues/:id/availability', validateBody(SetAvailabilityDto), OwnerController.setAvailability);

router.get('/bookings', OwnerController.getIncomingBookings);
router.get('/bookings/:id', OwnerController.getBookingById);
router.patch('/bookings/:id/accept', OwnerController.acceptBooking);
router.patch('/bookings/:id/decline', validateBody(DeclineBookingDto), OwnerController.declineBooking);

router.get('/analytics', OwnerController.getAnalytics);
router.get('/payouts', (_req, res) => res.json({ success: true, data: [] }));

export default router;
