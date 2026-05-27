import { AppDataSource } from '../../config/database';
import { redis } from '../../config/redis';
import { bookingQueue } from '../../config/queue';
import { Booking, BookingStatus } from '../../entities/Booking.entity';
import { Venue, VenueStatus } from '../../entities/Venue.entity';
import { Availability } from '../../entities/Availability.entity';
import { Payment, PaymentStatus } from '../../entities/Payment.entity';
import { razorpay } from '../../lib/razorpay';
import { AppError } from '../../lib/errors';
import type { CreateBookingDto } from './bookings.dto';

const bookingRepo = () => AppDataSource.getRepository(Booking);
const venueRepo = () => AppDataSource.getRepository(Venue);
const availRepo = () => AppDataSource.getRepository(Availability);
const paymentRepo = () => AppDataSource.getRepository(Payment);

function calcTotalAmount(venue: Venue, startTime: string, endTime: string): number {
  const [startH] = startTime.split(':').map(Number);
  const [endH] = endTime.split(':').map(Number);
  const hours = endH - startH;
  if (venue.pricePerHour) return Number(venue.pricePerHour) * hours;
  if (hours >= 8 && venue.priceFullDay) return Number(venue.priceFullDay);
  if (hours >= 4 && venue.priceHalfDay) return Number(venue.priceHalfDay);
  return 0;
}

async function acquireLock(key: string, ttlSec = 30): Promise<boolean> {
  // Redis SET key value NX EX ttl — atomic lock acquisition
  const result = await redis.call('SET', key, '1', 'NX', 'EX', ttlSec) as string | null;
  return result === 'OK';
}

async function releaseLock(key: string): Promise<void> {
  await redis.del(key);
}

export const BookingsService = {
  async create(userId: string, dto: CreateBookingDto) {
    const venue = await venueRepo().findOne({ where: { id: dto.venueId } });
    if (!venue || venue.status !== VenueStatus.APPROVED)
      throw new AppError('VENUE_NOT_FOUND', 'Venue not found or not available.', 404);

    if (dto.guestCount < venue.capacityMin || dto.guestCount > venue.capacityMax)
      throw new AppError(
        'CAPACITY_EXCEEDED',
        `Guest count must be between ${venue.capacityMin} and ${venue.capacityMax}.`,
        400
      );

    const lockKey = `venue:${dto.venueId}:date:${dto.date}:lock`;
    const locked = await acquireLock(lockKey);
    if (!locked) throw new AppError('SLOT_CONFLICT', 'Slot is being booked by another user. Try again.', 409);

    try {
      const avail = await availRepo().findOne({
        where: { venueId: dto.venueId, date: dto.date },
      });
      if (!avail) throw new AppError('SLOT_UNAVAILABLE', 'No availability set for this date.', 400);

      const requestedSlots = avail.slots.filter(
        (s) => s.time >= dto.startTime && s.time < dto.endTime
      );
      if (requestedSlots.length === 0)
        throw new AppError('SLOT_UNAVAILABLE', 'No slots found for the requested time range.', 400);

      const unavailable = requestedSlots.filter((s) => !s.available);
      if (unavailable.length > 0)
        throw new AppError('SLOT_UNAVAILABLE', 'One or more slots are already booked.', 409);

      const totalAmount = calcTotalAmount(venue, dto.startTime, dto.endTime);

      const booking = bookingRepo().create({
        userId,
        venueId: dto.venueId,
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        guestCount: dto.guestCount,
        totalAmount,
        status: BookingStatus.PENDING,
      });
      await bookingRepo().save(booking);

      await bookingQueue.add('auto-cancel', { bookingId: booking.id }, { delay: 15 * 60 * 1000 });

      return booking;
    } finally {
      await releaseLock(lockKey);
    }
  },

  async findAll(userId: string) {
    return bookingRepo().find({
      where: { userId },
      relations: ['venue', 'payment'],
      order: { createdAt: 'DESC' },
    });
  },

  async findById(id: string, userId: string) {
    const booking = await bookingRepo().findOne({
      where: { id, userId },
      relations: ['venue', 'payment'],
    });
    if (!booking) throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
    return booking;
  },

  async cancel(id: string, userId: string) {
    const booking = await bookingRepo().findOne({
      where: { id, userId },
      relations: ['payment'],
    });
    if (!booking) throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
    if (booking.status === BookingStatus.CANCELLED)
      throw new AppError('ALREADY_CANCELLED', 'Booking already cancelled.', 400);

    const eventDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
    const hoursUntilEvent = (eventDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hoursUntilEvent > 24) refundPercent = 100;
    else if (hoursUntilEvent >= 12) refundPercent = 50;

    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      booking.status = BookingStatus.CANCELLED;
      booking.cancelReason = 'Cancelled by user';
      booking.cancelledAt = new Date();
      await qr.manager.save(booking);

      const avail = await qr.manager.findOne(Availability, {
        where: { venueId: booking.venueId, date: booking.date },
      });
      if (avail) {
        avail.slots = avail.slots.map((s) =>
          s.time >= booking.startTime && s.time < booking.endTime
            ? { ...s, available: true }
            : s
        );
        await qr.manager.save(avail);
      }

      if (booking.payment?.status === PaymentStatus.SUCCESS && refundPercent > 0) {
        const refundAmount = Math.floor(
          (Number(booking.totalAmount) * refundPercent) / 100
        );
        const refund = await razorpay.payments.refund(booking.payment.gatewayId, {
          amount: refundAmount * 100, // paise
        });
        booking.payment.status = PaymentStatus.REFUNDED;
        booking.payment.refundId = refund.id;
        booking.payment.refundedAt = new Date();
        await qr.manager.save(booking.payment);
      }

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }

    return booking;
  },
};
