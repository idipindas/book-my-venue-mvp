import { AppDataSource } from '../../config/database';
import { Venue, VenueStatus } from '../../entities/Venue.entity';
import { VenuePhoto } from '../../entities/VenuePhoto.entity';
import { Availability } from '../../entities/Availability.entity';
import { Booking, BookingStatus } from '../../entities/Booking.entity';
import { AppError } from '../../lib/errors';
import { cloudinary, deleteCloudinaryAsset } from '../../lib/cloudinary';
import type { CreateVenueDto, UpdateVenueDto, SetAvailabilityDto } from './owner.dto';

const MAX_PHOTOS = 5;
const photoRepo = () => AppDataSource.getRepository(VenuePhoto);

const venueRepo = () => AppDataSource.getRepository(Venue);
const availRepo = () => AppDataSource.getRepository(Availability);
const bookingRepo = () => AppDataSource.getRepository(Booking);

function uploadVenueImage(venueId: string, file: Express.Multer.File) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `bookmyvenue/venues/${venueId}`, resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(file.buffer);
  });
}

export const OwnerService = {
  async createVenue(ownerId: string, dto: CreateVenueDto, files: Express.Multer.File[]) {
    const venue = venueRepo().create({ ...dto, ownerId, status: VenueStatus.PENDING });
    const savedVenue = await venueRepo().save(venue);

    const uploaded: { url: string; publicId: string }[] = [];
    try {
      for (const file of files) {
        const result = await uploadVenueImage(savedVenue.id, file);
        uploaded.push(result);
      }
      const photos = uploaded.map((r, i) =>
        photoRepo().create({ venueId: savedVenue.id, ownerId, url: r.url, publicId: r.publicId, position: i }),
      );
      await photoRepo().save(photos);
      return this.getMyVenueById(ownerId, savedVenue.id);
    } catch (err) {
      await Promise.all(uploaded.map((u) => deleteCloudinaryAsset(u.publicId).catch(() => undefined)));
      await venueRepo().delete(savedVenue.id).catch(() => undefined);
      throw new AppError('VENUE_CREATE_FAILED', 'Failed to upload venue photos.', 500);
    }
  },

  async getMyVenues(ownerId: string) {
    return venueRepo().find({
      where: { ownerId },
      relations: ['photos'],
      order: { createdAt: 'DESC', photos: { position: 'ASC' } },
    });
  },

  async getMyVenueById(ownerId: string, id: string) {
    const venue = await venueRepo().findOne({
      where: { id, ownerId },
      relations: ['photos'],
      order: { photos: { position: 'ASC' } },
    });
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

  async uploadVenuePhotos(ownerId: string, venueId: string, files: Express.Multer.File[]) {
    await this.getMyVenueById(ownerId, venueId);

    if (files.length === 0)
      throw new AppError('NO_FILES', 'At least 1 photo is required.', 400);

    const existing = await photoRepo().find({ where: { venueId }, order: { position: 'ASC' } });

    if (existing.length + files.length > MAX_PHOTOS)
      throw new AppError(
        'TOO_MANY_PHOTOS',
        `A venue can have at most ${MAX_PHOTOS} photos. Currently has ${existing.length}.`,
        400,
      );

    const uploadResults = await Promise.all(
      files.map((file) => uploadVenueImage(venueId, file)),
    );

    const newPhotos = uploadResults.map((r, i) =>
      photoRepo().create({
        venueId,
        ownerId,
        url: r.url,
        publicId: r.publicId,
        position: existing.length + i,
      }),
    );

    await photoRepo().save(newPhotos);
    return photoRepo().find({ where: { venueId }, order: { position: 'ASC' } });
  },

  async deleteVenuePhoto(ownerId: string, venueId: string, url: string) {
    await this.getMyVenueById(ownerId, venueId);

    const photo = await photoRepo().findOne({ where: { venueId, url } });
    if (!photo)
      throw new AppError('PHOTO_NOT_FOUND', 'Photo not found on this venue.', 404);

    const count = await photoRepo().count({ where: { venueId } });
    if (count === 1)
      throw new AppError('MIN_PHOTOS', 'A venue must have at least 1 photo.', 400);

    try {
      await deleteCloudinaryAsset(photo.publicId);
    } catch {
      // swallow — asset may already be gone from Cloudinary
    }

    await photoRepo().remove(photo);

    // resequence positions so there are no gaps
    const remaining = await photoRepo().find({ where: { venueId }, order: { position: 'ASC' } });
    await Promise.all(
      remaining.map((p, i) => photoRepo().update(p.id, { position: i })),
    );

    return photoRepo().find({ where: { venueId }, order: { position: 'ASC' } });
  },

  async reorderVenuePhotos(ownerId: string, venueId: string, ids: string[]) {
    await this.getMyVenueById(ownerId, venueId);

    const existing = await photoRepo().find({ where: { venueId } });
    const existingIds = existing.map((p) => p.id);

    if (ids.length !== existingIds.length || !ids.every((id) => existingIds.includes(id)))
      throw new AppError('INVALID_PHOTOS', 'Reorder list must contain exactly the same photo IDs as the venue.', 400);

    await Promise.all(
      ids.map((id, i) => photoRepo().update(id, { position: i })),
    );

    return photoRepo().find({ where: { venueId }, order: { position: 'ASC' } });
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
