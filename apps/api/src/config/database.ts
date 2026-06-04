import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './env';
import { User } from '../entities/User.entity';
import { Venue } from '../entities/Venue.entity';
import { VenuePhoto } from '../entities/VenuePhoto.entity';
import { Availability } from '../entities/Availability.entity';
import { Booking } from '../entities/Booking.entity';
import { Payment } from '../entities/Payment.entity';
import { Notification } from '../entities/Notification.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.DATABASE_URL,
  synchronize: true,
  logging: config.NODE_ENV === 'development',
  entities: [User, Venue, VenuePhoto, Availability, Booking, Payment, Notification],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  ssl:{
    rejectUnauthorized: false
  }
});
