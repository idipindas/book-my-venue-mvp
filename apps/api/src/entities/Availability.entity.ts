import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import type { Venue } from './Venue.entity';

@Entity('availability')
@Unique(['venueId', 'date'])
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  venueId: string;

  @Index()
  @Column('date')
  date: string;

  @Column('jsonb')
  slots: { time: string; available: boolean }[];

  @ManyToOne('Venue', 'availability')
  @JoinColumn({ name: 'venueId' })
  venue: Venue;
}
