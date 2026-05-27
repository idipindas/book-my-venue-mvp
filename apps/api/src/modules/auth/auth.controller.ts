import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import type {
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './auth.dto';

export const AuthController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body as RegisterDto);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body as LoginDto);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async google(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.googleAuth(req.body as GoogleAuthDto);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.logout(req.user!.id, req.body as RefreshTokenDto);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await AuthService.refresh(req.body as RefreshTokenDto);
      res.json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.verifyEmail(req.body as VerifyEmailDto);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.forgotPassword((req.body as ForgotPasswordDto).email);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.resetPassword(req.body as ResetPasswordDto);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },
};
