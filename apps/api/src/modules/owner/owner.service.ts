import { AppDataSource } from '../../config/database';
import { Venue, VenueStatus } from '../../entities/Venue.entity';
import { Availability } from '../../entities/Availability.entity';
import { Booking, BookingStatus } from '../../entities/Booking.entity';
import { AppError } from '../../lib/errors';
import type { CreateVenueDto, UpdateVenueDto, SetAvailabilityDto } from './owner.dto';

const venueRepo = () => AppDataSource.getRepository(Venue);
const availRepo = () => AppDataSource.getRepository(Availability);
const bookingRepo = () => AppDataSource.getRepository(Booking);

export const OwnerService = {
  async createVenue(ownerId: string, dto: CreateVenueDto) {
    const venue = venueRepo().create({ ...dto, ownerId, status: VenueStatus.PENDING });
    return venueRepo().save(venue);
  },

  async getMyVenues(ownerId: string) {
    return venueRepo().find({ where: { ownerId }, order: { createdAt: 'DESC' } });
  },

  async getMyVenueById(ownerId: string, id: string) {
    const venue = await venueRepo().findOne({ where: { id, ownerId } });
    if (!venue) throw new AppError('VENUE_NOT_FOUND', 'Venue not found.', 404);
    return venue;
  },

  async updateVenue(ownerId: string, id: string, dto: UpdateVenueDto) {
    const venue = await this.getMyVenueById(ownerId, id);
    Object.assign(venue, dto);
    return venueRepo().save(venue);
  },

  async setVenueStatus(ownerId: string, id: string, status: VenueStatus) {
    const venue = await this.getMyVenueById(ownerId, id);
    if (venue.status === VenueStatus.PENDING || venue.status === VenueStatus.REJECTED)
      throw new AppError('INVALID_STATE', 'Cannot change status of a pending or rejected venue.', 400);
    venue.status = status;
    return venueRepo().save(venue);
  },

  async deleteVenue(ownerId: string, id: string) {
    const venue = await this.getMyVenueById(ownerId, id);
    await venueRepo().remove(venue);
  },

  async setAvailability(ownerId: string, venueId: string, dto: SetAvailabilityDto) {
    await this.getMyVenueById(ownerId, venueId);

    let avail = await availRepo().findOne({ where: { venueId, date: dto.date } });
    if (avail) {
      avail.slots = dto.slots;
    } else {
      avail = availRepo().create({ venueId, date: dto.date, slots: dto.slots });
    }
    return availRepo().save(avail);
  },

  async getIncomingBookings(ownerId: string) {
    const venues = await venueRepo().find({ where: { ownerId }, select: ['id'] });
    const venueIds = venues.map((v) => v.id);
    if (venueIds.length === 0) return [];

    return bookingRepo()
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.venue', 'venue')
      .leftJoinAndSelect('b.user', 'user')
      .where('b.venueId IN (:...venueIds)', { venueIds })
      .orderBy('b.createdAt', 'DESC')
      .getMany();
  },

  async getBookingById(ownerId: string, bookingId: string) {
    const venues = await venueRepo().find({ where: { ownerId }, select: ['id'] });
    const venueIds = venues.map((v) => v.id);

    const booking = await bookingRepo().findOne({
      where: { id: bookingId },
      relations: ['venue', 'user', 'payment'],
    });
    if (!booking || !venueIds.includes(booking.venueId))
      throw new AppError('BOOKING_NOT_FOUND', 'Booking not found.', 404);
    return booking;
  },

  async acceptBooking(ownerId: string, bookingId: string) {
    const booking = await this.getBookingById(ownerId, bookingId);
    if (booking.status !== BookingStatus.PENDING)
      throw new AppError('INVALID_STATE', 'Only pending bookings can be accepted.', 400);
    booking.status = BookingStatus.CONFIRMED;
    return bookingRepo().save(booking);
  },

  async declineBooking(ownerId: string, bookingId: string, reason?: string) {
    const booking = await this.getBookingById(ownerId, bookingId);
    if (booking.status !== BookingStatus.PENDING)
      throw new AppError('INVALID_STATE', 'Only pending bookings can be declined.', 400);
    booking.status = BookingStatus.CANCELLED;
    booking.cancelReason = reason ?? 'Declined by owner';
    booking.cancelledAt = new Date();
    return bookingRepo().save(booking);
  },

  async getAnalytics(ownerId: string) {
    const venues = await venueRepo().find({ where: { ownerId }, select: ['id'] });
    const venueIds = venues.map((v) => v.id);
    if (venueIds.length === 0) return { totalRevenue: 0, totalBookings: 0 };

    const result = await bookingRepo()
      .createQueryBuilder('b')
      .select('SUM(b.totalAmount)', 'totalRevenue')
      .addSelect('COUNT(b.id)', 'totalBookings')
      .where('b.venueId IN (:...venueIds)', { venueIds })
      .andWhere('b.status = :status', { status: BookingStatus.CONFIRMED })
      .getRawOne();

    return {
      totalRevenue: parseFloat(result.totalRevenue ?? '0'),
      totalBookings: parseInt(result.totalBookings ?? '0'),
    };
  },
};
