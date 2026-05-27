import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import type { Venue } from './Venue.entity';
import type { Booking } from './Booking.entity';
import type { Notification } from './Notification.entity';

export enum Role {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isSuspended: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Venue', 'owner')
  venues: Venue[];

  @OneToMany('Booking', 'user')
  bookings: Booking[];

  @OneToMany('Notification', 'user')
  notifications: Notification[];
}
