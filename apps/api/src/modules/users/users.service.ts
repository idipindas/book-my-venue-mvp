import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User.entity';
import { AppError } from '../../lib/errors';
import type { UpdateProfileDto, ChangePasswordDto } from './users.dto';

const userRepo = () => AppDataSource.getRepository(User);

export const UsersService = {
  async getMe(userId: string) {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw new AppError('USER_NOT_FOUND', 'User not found.', 404);
    const { passwordHash: _, ...safe } = user;
    return safe;
  },

  async updateMe(userId: string, dto: UpdateProfileDto) {
    await userRepo().update(userId, { ...(dto.name ? { name: dto.name } : {}) });
    return this.getMe(userId);
  },

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user || !user.passwordHash)
      throw new AppError('INVALID_CREDENTIALS', 'No password set on this account.', 400);

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid)
      throw new AppError('INVALID_CREDENTIALS', 'Current password is incorrect.', 401);

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await userRepo().update(userId, { passwordHash });
  },
};
