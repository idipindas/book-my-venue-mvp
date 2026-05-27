import { AppDataSource } from '../../config/database';
import { Venue, VenueStatus, VenueType } from '../../entities/Venue.entity';
import { Availability } from '../../entities/Availability.entity';
import { AppError } from '../../lib/errors';
import type { CreateVenueDto, UpdateVenueDto } from './venues.dto';

const venueRepo = () => AppDataSource.getRepository(Venue);
const availRepo = () => AppDataSource.getRepository(Availability);

export const VenueService = {
  async findNearby(lat: number, lng: number, radiusKm = 10) {
    const results = await venueRepo().query(
      `SELECT *,
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude::float)) *
          cos(radians(longitude::float) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude::float))
        )) AS distance
      FROM venues
      WHERE status = 'APPROVED'
      HAVING (6371 * acos(
          cos(radians($1)) * cos(radians(latitude::float)) *
          cos(radians(longitude::float) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude::float))
        )) < $3
      ORDER BY distance`,
      [lat, lng, radiusKm]
    );
    return results;
  },

  async search(q: string) {
    return venueRepo()
      .createQueryBuilder('v')
      .where('v.status = :status', { status: VenueStatus.APPROVED })
      .andWhere(
        "to_tsvector('english', v.name || ' ' || v.description || ' ' || v.city) @@ plainto_tsquery('english', :q)",
        { q }
      )
      .getMany();
  },

  async findAll(filters: {
    type?: VenueType;
    minCapacity?: number;
    maxCapacity?: number;
    minPrice?: number;
    maxPrice?: number;
    date?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 12, 50);
    const skip = (page - 1) * limit;

    const qb = venueRepo()
      .createQueryBuilder('v')
      .where('v.status = :status', { status: VenueStatus.APPROVED });

    if (filters.type) qb.andWhere('v.type = :type', { type: filters.type });
    if (filters.city) qb.andWhere('LOWER(v.city) = LOWER(:city)', { city: filters.city });
    if (filters.minCapacity) qb.andWhere('v.capacityMax >= :minCap', { minCap: filters.minCapacity });
    if (filters.maxCapacity) qb.andWhere('v.capacityMin <= :maxCap', { maxCap: filters.maxCapacity });
    if (filters.minPrice) qb.andWhere('v.pricePerHour >= :minP', { minP: filters.minPrice });
    if (filters.maxPrice) qb.andWhere('v.pricePerHour <= :maxP', { maxP: filters.maxPrice });

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { data, meta: { page, limit, total } };
  },

  async findById(id: string) {
    const venue = await venueRepo().findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!venue) throw new AppError('VENUE_NOT_FOUND', 'Venue not found.', 404);
    return venue;
  },

  async getAvailability(venueId: string, date: string) {
    await this.findById(venueId);
    const avail = await availRepo().findOne({ where: { venueId, date } });
    if (!avail) return { date, slots: [] };
    return avail;
  },

  async create(ownerId: string, dto: CreateVenueDto) {
    const venue = venueRepo().create({ ...dto, ownerId });
    return venueRepo().save(venue);
  },

  async update(id: string, ownerId: string, dto: UpdateVenueDto) {
    const venue = await venueRepo().findOne({ where: { id } });
    if (!venue) throw new AppError('VENUE_NOT_FOUND', 'Venue not found.', 404);
    if (venue.ownerId !== ownerId)
      throw new AppError('FORBIDDEN', 'Not your venue.', 403);
    Object.assign(venue, dto);
    return venueRepo().save(venue);
  },
};
