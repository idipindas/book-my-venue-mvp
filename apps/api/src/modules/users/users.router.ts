import { Router } from 'express';
import { UsersController } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { UpdateProfileDto, ChangePasswordDto } from './users.dto';

const router = Router();

router.use(authMiddleware);

router.get('/me', UsersController.getMe);
router.put('/me', validateBody(UpdateProfileDto), UsersController.updateMe);
router.put('/me/password', validateBody(ChangePasswordDto), UsersController.changePassword);

export default router;
