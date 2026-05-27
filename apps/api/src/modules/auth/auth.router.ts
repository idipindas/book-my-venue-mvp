import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import {
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './auth.dto';

const router = Router();

router.post('/register', validateBody(RegisterDto), AuthController.register);
router.post('/login', validateBody(LoginDto), AuthController.login);
router.post('/google', validateBody(GoogleAuthDto), AuthController.google);
router.post('/logout', authMiddleware, validateBody(RefreshTokenDto), AuthController.logout);
router.post('/refresh', validateBody(RefreshTokenDto), AuthController.refresh);
router.post('/verify-email', validateBody(VerifyEmailDto), AuthController.verifyEmail);
router.post('/forgot-password', validateBody(ForgotPasswordDto), AuthController.forgotPassword);
router.post('/reset-password', validateBody(ResetPasswordDto), AuthController.resetPassword);

export default router;
