import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { User } from './User.entity';
import type { Venue } from './Venue.entity';
import type { Payment } from './Payment.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Index()
  @Column()
  venueId: string;

  @Index()
  @Column('date')
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column('int')
  guestCount: number;

  @Column('decimal')
  totalAmount: number;

  @Index()
  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ nullable: true, type: 'timestamptz' })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('User', 'bookings')
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne('Venue', 'bookings')
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @OneToOne('Payment', 'booking')
  payment: Payment;
}
