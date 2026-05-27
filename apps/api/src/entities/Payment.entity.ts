import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Booking } from './Booking.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  bookingId: string;

  @Column('decimal')
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ nullable: true })
  gatewayId: string;

  @Index()
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ nullable: true })
  refundId: string;

  @Column({ nullable: true, type: 'timestamptz' })
  refundedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne('Booking', 'payment')
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
