import { Router } from 'express';
import { BookingsController } from './bookings.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleGuard } from '../../middleware/role.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { CreateBookingDto } from './bookings.dto';
import { Role } from '../../entities/User.entity';

const router = Router();

router.use(authMiddleware, roleGuard(Role.USER, Role.ADMIN));

router.post('/', validateBody(CreateBookingDto), BookingsController.create);
router.get('/', BookingsController.getAll);
router.get('/:id', BookingsController.getById);
router.delete('/:id', BookingsController.cancel);

export default router;
