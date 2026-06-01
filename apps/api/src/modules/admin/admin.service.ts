import { AppDataSource } from '../../config/database';
import { Venue, VenueStatus } from '../../entities/Venue.entity';
import { User } from '../../entities/User.entity';
import { Booking } from '../../entities/Booking.entity';
import { Payment, PaymentStatus } from '../../entities/Payment.entity';
import { AppError } from '../../lib/errors';

const venueRepo = () => AppDataSource.getRepository(Venue);
const userRepo = () => AppDataSource.getRepository(User);
const bookingRepo = () => AppDataSource.getRepository(Booking);
const paymentRepo = () => AppDataSource.getRepository(Payment);

export const AdminService = {
  async getPendingVenues() {
    return venueRepo().find({
      where: { status: VenueStatus.PENDING },
      relations: ['owner', 'photos'],
      order: { createdAt: 'DESC', photos: { position: 'ASC' } },
    });
  },

  async approveVenue(id: string) {
    const venue = await venueRepo().findOne({ where: { id } });
    if (!venue) throw new AppError('VENUE_NOT_FOUND', 'Venue not found.', 404);
    venue.status = VenueStatus.APPROVED;
    venue.rejectedNote = null as unknown as string;
    return venueRepo().save(venue);
  },

  async rejectVenue(id: string, note: string) {
    const venue = await venueRepo().findOne({ where: { id } });
    if (!venue) throw new AppError('VENUE_NOT_FOUND', 'Venue not found.', 404);
    venue.status = VenueStatus.REJECTED;
    venue.rejectedNote = note;
    return venueRepo().save(venue);
  },

  async getAllVenues(page = 1, limit = 20) {
    const [data, total] = await venueRepo().findAndCount({
      relations: ['owner'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  },

  async forceDeleteVenue(id: string) {
    const venue = await venueRepo().findOne({ where: { id } });
    if (!venue) throw new AppError('VENUE_NOT_FOUND', 'Venue not found.', 404);
    await venueRepo().remove(venue);
  },

  async getAllUsers(page = 1, limit = 20) {
    const [data, total] = await userRepo().findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: data.map(({ passwordHash: _, ...u }) => u), meta: { page, limit, total } };
  },

  async suspendUser(id: string) {
    const user = await userRepo().findOne({ where: { id } });
    if (!user) throw new AppError('USER_NOT_FOUND', 'User not found.', 404);
    user.isSuspended = true;
    await userRepo().save(user);
  },

  async deleteUser(id: string) {
    const user = await userRepo().findOne({ where: { id } });
    if (!user) throw new AppError('USER_NOT_FOUND', 'User not found.', 404);
    await userRepo().remove(user);
  },

  async getAllBookings(page = 1, limit = 20) {
    const [data, total] = await bookingRepo().findAndCount({
      relations: ['venue', 'user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  },

  async getAllPayments(page = 1, limit = 20) {
    const [data, total] = await paymentRepo().findAndCount({
      relations: ['booking'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total } };
  },

  async flagPayment(id: string) {
    const payment = await paymentRepo().findOne({ where: { id } });
    if (!payment) throw new AppError('PAYMENT_NOT_FOUND', 'Payment not found.', 404);
    payment.status = PaymentStatus.FAILED;
    return paymentRepo().save(payment);
  },

  async getPlatformAnalytics() {
    const totalVenues = await venueRepo().count();
    const totalUsers = await userRepo().count();
    const totalBookings = await bookingRepo().count();
    const revenueResult = await paymentRepo()
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'totalRevenue')
      .where('p.status = :status', { status: PaymentStatus.SUCCESS })
      .getRawOne();

    return {
      totalVenues,
      totalUsers,
      totalBookings,
      totalRevenue: parseFloat(revenueResult?.totalRevenue ?? '0'),
    };
  },
};
