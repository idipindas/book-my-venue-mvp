import { Router } from 'express';
import { VenueController } from './venues.controller';

const router = Router();

router.get('/nearby', VenueController.getNearby);
router.get('/search', VenueController.search);
router.get('/', VenueController.getAll);
router.get('/:id', VenueController.getById);
router.get('/:id/availability', VenueController.getAvailability);

export default router;
