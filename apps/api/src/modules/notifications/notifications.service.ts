import { AppDataSource } from '../../config/database';
import { Notification } from '../../entities/Notification.entity';
import { AppError } from '../../lib/errors';

const notifRepo = () => AppDataSource.getRepository(Notification);

export const NotificationsService = {
  async findAll(userId: string, page = 1, limit = 20) {
    const [data, total] = await notifRepo().findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  },

  async markRead(id: string, userId: string) {
    const notif = await notifRepo().findOne({ where: { id, userId } });
    if (!notif) throw new AppError('NOTIF_NOT_FOUND', 'Notification not found.', 404);
    notif.isRead = true;
    return notifRepo().save(notif);
  },

  async markAllRead(userId: string) {
    await notifRepo().update({ userId, isRead: false }, { isRead: true });
  },

  async create(userId: string, title: string, message: string) {
    const notif = notifRepo().create({ userId, title, message });
    return notifRepo().save(notif);
  },
};
