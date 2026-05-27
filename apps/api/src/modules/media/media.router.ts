import { Router } from 'express';
import { MediaController } from './media.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleGuard } from '../../middleware/role.middleware';
import { uploadMiddleware } from '../../middleware/upload.middleware';
import { Role } from '../../entities/User.entity';

const router = Router();

router.use(authMiddleware, roleGuard(Role.OWNER, Role.ADMIN));

router.post('/upload', uploadMiddleware.array('photos', 10), MediaController.upload);
router.delete('/:id', MediaController.delete);

export default router;
