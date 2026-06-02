import { Queue, Worker } from 'bullmq';
import { ioredisClient as redis } from './redis';
import { AppDataSource } from './database';
import { Booking, BookingStatus } from '../entities/Booking.entity';
import { Availability } from '../entities/Availability.entity';
import { logger } from '../lib/logger';

const connection = redis;

export const bookingQueue = new Queue('bookings', { connection });

export function startBookingWorker(): void {
  const worker = new Worker(
    'bookings',
    async (job) => {
      if (job.name === 'auto-cancel') {
        const { bookingId } = job.data as { bookingId: string };
        const bookingRepo = AppDataSource.getRepository(Booking);
        const booking = await bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking || booking.status !== BookingStatus.PENDING) return;

        const availRepo = AppDataSource.getRepository(Availability);
        const avail = await availRepo.findOne({
          where: { venueId: booking.venueId, date: booking.date },
        });

        booking.status = BookingStatus.CANCELLED;
        booking.cancelReason = 'Payment not received within 15 minutes';
        booking.cancelledAt = new Date();
        await bookingRepo.save(booking);

        if (avail) {
          avail.slots = avail.slots.map((s) =>
            s.time >= booking.startTime && s.time < booking.endTime
              ? { ...s, available: true }
              : s
          );
          await availRepo.save(avail);
        }

        logger.info({ bookingId }, 'Booking auto-cancelled due to payment timeout');
      }
    },
    { connection }
  );

  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, err }, 'Booking job failed')
  );
}
