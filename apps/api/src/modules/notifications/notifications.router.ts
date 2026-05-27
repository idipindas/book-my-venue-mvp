import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', NotificationsController.getAll);
router.patch('/:id/read', NotificationsController.markRead);
router.patch('/read-all', NotificationsController.markAllRead);

export default router;
