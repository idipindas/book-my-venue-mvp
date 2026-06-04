import { AppDataSource } from '../../config/database';
import { Booking, BookingStatus } from '../../entities/Booking.entity';
import { Payment, PaymentStatus } from '../../entities/Payment.entity';
import { Availability } from '../../entities/Availability.entity';
import { razorpay, verifyWebhookSignature, verifyPaymentSignature } from '../../lib/razorpay';
import { AppError } from '../../lib/errors';

const bookingRepo = () => AppDataSource.getRepository(Booking);
const paymentRepo = () => AppDataSource.getRepository(Payment);

export const PaymentsService = {
  async initiate(userId: string, bookingId: string) {
    const booking = await bookingRepo().findOne({ where: { id: bookingId, userId } });
    if (!booking) throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
    if (booking.status !== BookingStatus.PENDING)
      throw new AppError('INVALID_STATE', 'Booking is not in pending state.', 400);

    const existing = await paymentRepo().findOne({ where: { bookingId } });
    if (existing?.status === PaymentStatus.SUCCESS)
      throw new AppError('ALREADY_PAID', 'Booking already paid.', 400);

    const order = await razorpay.orders.create({
      amount: Math.round(Number(booking.totalAmount) * 100),
      currency: 'INR',
      receipt: booking.id,
    });

    const payment =
      existing ??
      paymentRepo().create({ bookingId, amount: booking.totalAmount });
    payment.gatewayId = order.id;
    payment.status = PaymentStatus.PENDING;
    await paymentRepo().save(payment);

    return { orderId: order.id, amount: order.amount, currency: order.currency };
  },

  async handleWebhook(rawBody: string, signature: string) {
    if (!verifyWebhookSignature(rawBody, signature))
      throw new AppError('INVALID_SIGNATURE', 'Webhook signature mismatch.', 400);

    const event = JSON.parse(rawBody) as {
      event: string;
      payload: { payment: { entity: { order_id: string; id: string } } };
    };

    if (event.event !== 'payment.captured') return;

    const orderId = event.payload.payment.entity.order_id;
    const paymentId = event.payload.payment.entity.id;

    const payment = await paymentRepo().findOne({ where: { gatewayId: orderId } });
    if (!payment) return;

    const booking = await bookingRepo().findOne({ where: { id: payment.bookingId } });
    if (!booking) return;

    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      payment.status = PaymentStatus.SUCCESS;
      payment.gatewayId = paymentId;
      await qr.manager.save(payment);

      booking.status = BookingStatus.CONFIRMED;
      await qr.manager.save(booking);

      const avail = await qr.manager.findOne(Availability, {
        where: { venueId: booking.venueId, date: booking.date },
      });
      if (avail) {
        avail.slots = avail.slots.map((s) =>
          s.time >= booking.startTime && s.time < booking.endTime
            ? { ...s, available: false }
            : s
        );
        await qr.manager.save(avail);
      }

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  },

  async verify(
    userId: string,
    data: { bookingId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
  ) {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature))
      throw new AppError('INVALID_SIGNATURE', 'Payment signature mismatch.', 400);

    const booking = await bookingRepo().findOne({ where: { id: bookingId, userId } });
    if (!booking) throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);

    const payment = await paymentRepo().findOne({ where: { bookingId } });
    if (!payment) throw new AppError('PAYMENT_NOT_FOUND', 'Payment record not found.', 404);

    if (payment.status === PaymentStatus.SUCCESS)
      return { status: 'already_confirmed', bookingId };

    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      payment.status = PaymentStatus.SUCCESS;
      payment.gatewayId = razorpayPaymentId;
      await qr.manager.save(payment);

      booking.status = BookingStatus.CONFIRMED;
      await qr.manager.save(booking);

      const avail = await qr.manager.findOne(Availability, {
        where: { venueId: booking.venueId, date: booking.date },
      });
      if (avail) {
        avail.slots = avail.slots.map((s) =>
          s.time >= booking.startTime && s.time < booking.endTime
            ? { ...s, available: false }
            : s
        );
        await qr.manager.save(avail);
      }

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }

    return { status: 'confirmed', bookingId };
  },

  async refund(userId: string, bookingId: string) {
    const booking = await bookingRepo().findOne({
      where: { id: bookingId, userId },
      relations: ['payment'],
    });
    if (!booking) throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
    if (!booking.payment || booking.payment.status !== PaymentStatus.SUCCESS)
      throw new AppError('NO_PAYMENT', 'No successful payment found for this booking.', 400);

    const refund = await razorpay.payments.refund(booking.payment.gatewayId, {
      amount: Math.round(Number(booking.totalAmount) * 100),
    });

    booking.payment.status = PaymentStatus.REFUNDED;
    booking.payment.refundId = refund.id;
    booking.payment.refundedAt = new Date();
    await paymentRepo().save(booking.payment);

    return booking.payment;
  },
};
