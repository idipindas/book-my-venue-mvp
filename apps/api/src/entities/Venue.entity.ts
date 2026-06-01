import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import type { User } from './User.entity';
import type { Booking } from './Booking.entity';
import type { Availability } from './Availability.entity';

export enum VenueType {
  BIRTHDAY_HALL = 'birthday_hall',
  CAFE = 'cafe',
  HOTEL = 'hotel',
  RESORT = 'resort',
  AUDITORIUM = 'auditorium',
  MEETUP = 'meetup',
  MALL = 'mall',
  VENUE_HALL = 'venue_hall',
}

export enum VenueStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
}

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: VenueType })
  type: VenueType;

  @Column()
  address: string;

  @Index()
  @Column()
  city: string;

  @Column({ default: 'Kerala' })
  state: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @Column('int')
  capacityMin: number;

  @Column('int')
  capacityMax: number;

  @Column('decimal', { nullable: true })
  pricePerHour: number;

  @Column('decimal', { nullable: true })
  priceHalfDay: number;

  @Column('decimal', { nullable: true })
  priceFullDay: number;

  @Column('text', { array: true, default: [] })
  amenities: string[];

  @OneToMany('VenuePhoto', 'venue')
  photos: import('./VenuePhoto.entity').VenuePhoto[];

  @Index()
  @Column({ type: 'enum', enum: VenueStatus, default: VenueStatus.PENDING })
  status: VenueStatus;

  @Column({ nullable: true })
  rejectedNote: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('User', 'venues')
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany('Booking', 'venue')
  bookings: Booking[];

  @OneToMany('Availability', 'venue')
  availability: Availability[];
}
