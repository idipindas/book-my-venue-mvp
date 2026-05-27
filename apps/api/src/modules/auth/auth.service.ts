import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { AppDataSource } from '../../config/database';
import { redis } from '../../config/redis';
import { User, Role } from '../../entities/User.entity';
import { config } from '../../config/env';
import { AppError } from '../../lib/errors';
import { sendMail, verificationEmailHtml, resetPasswordEmailHtml } from '../../lib/mailer';
import type {
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  RefreshTokenDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './auth.dto';

const userRepo = () => AppDataSource.getRepository(User);
const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

function generateTokens(userId: string, role: Role) {
  const accessToken = jwt.sign(
    { sub: userId, role },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRY } as jwt.SignOptions
  );
  const refreshToken = jwt.sign(
    { sub: userId },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRY } as jwt.SignOptions
  );
  return { accessToken, refreshToken };
}

async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const ttl = 7 * 24 * 60 * 60; // 7 days
  await redis.set(`refresh:${userId}:${token}`, '1', 'EX', ttl);
}

async function revokeRefreshToken(userId: string, token: string): Promise<void> {
  await redis.del(`refresh:${userId}:${token}`);
}

export const AuthService = {
  async register(dto: RegisterDto) {
    const existing = await userRepo().findOne({ where: { email: dto.email } });
    if (existing) throw new AppError('EMAIL_TAKEN', 'Email already in use.', 409);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verifyToken = uuidv4();

    const user = userRepo().create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role ?? Role.USER,
    });
    await userRepo().save(user);

    await redis.set(`verify:${verifyToken}`, user.id, 'EX', 24 * 60 * 60);

    await sendMail({
      to: user.email,
      subject: 'Verify your BookMyVenue account',
      html: verificationEmailHtml(user.name, verifyToken),
    }).catch(() => null); // non-blocking

    const tokens = generateTokens(user.id, user.role);
    await storeRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  },

  async login(dto: LoginDto) {
    const user = await userRepo().findOne({ where: { email: dto.email } });
    if (!user || !user.passwordHash)
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid)
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);

    if (user.isSuspended)
      throw new AppError('ACCOUNT_SUSPENDED', 'Your account has been suspended.', 403);

    const tokens = generateTokens(user.id, user.role);
    await storeRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  },

  async googleAuth(dto: GoogleAuthDto) {
    const ticket = await googleClient.verifyIdToken({
      idToken: dto.idToken,
      audience: config.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw new AppError('GOOGLE_AUTH_FAILED', 'Invalid Google token.', 401);

    let user = await userRepo().findOne({
      where: [{ googleId: payload.sub }, { email: payload.email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = payload.sub;
        await userRepo().save(user);
      }
    } else {
      user = userRepo().create({
        name: payload.name ?? payload.email,
        email: payload.email,
        googleId: payload.sub,
        isVerified: true,
        role: Role.USER,
      });
      await userRepo().save(user);
    }

    if (user.isSuspended)
      throw new AppError('ACCOUNT_SUSPENDED', 'Your account has been suspended.', 403);

    const tokens = generateTokens(user.id, user.role);
    await storeRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  },

  async logout(userId: string, dto: RefreshTokenDto) {
    await revokeRefreshToken(userId, dto.refreshToken);
  },

  async refresh(dto: RefreshTokenDto) {
    let payload: { sub: string };
    try {
      payload = jwt.verify(dto.refreshToken, config.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      throw new AppError('INVALID_TOKEN', 'Invalid refresh token.', 401);
    }

    const exists = await redis.get(`refresh:${payload.sub}:${dto.refreshToken}`);
    if (!exists) throw new AppError('INVALID_TOKEN', 'Refresh token revoked or expired.', 401);

    const user = await userRepo().findOne({ where: { id: payload.sub } });
    if (!user) throw new AppError('INVALID_TOKEN', 'User not found.', 401);

    await revokeRefreshToken(payload.sub, dto.refreshToken);
    const tokens = generateTokens(user.id, user.role);
    await storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  },

  async verifyEmail(dto: VerifyEmailDto) {
    const userId = await redis.get(`verify:${dto.token}`);
    if (!userId) throw new AppError('INVALID_TOKEN', 'Verification token invalid or expired.', 400);

    await userRepo().update(userId, { isVerified: true });
    await redis.del(`verify:${dto.token}`);
  },

  async forgotPassword(email: string) {
    const user = await userRepo().findOne({ where: { email } });
    if (!user) return; // silently succeed to prevent email enumeration

    const token = uuidv4();
    await redis.set(`reset:${token}`, user.id, 'EX', 60 * 60);

    await sendMail({
      to: user.email,
      subject: 'Reset your BookMyVenue password',
      html: resetPasswordEmailHtml(user.name, token),
    }).catch(() => null);
  },

  async resetPassword(dto: ResetPasswordDto) {
    const userId = await redis.get(`reset:${dto.token}`);
    if (!userId) throw new AppError('INVALID_TOKEN', 'Reset token invalid or expired.', 400);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await userRepo().update(userId, { passwordHash });
    await redis.del(`reset:${dto.token}`);
  },
};
