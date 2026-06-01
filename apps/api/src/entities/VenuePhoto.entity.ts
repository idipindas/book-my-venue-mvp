import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Venue } from './Venue.entity';

@Entity('venue_photos')
export class VenuePhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  venueId: string;

  @Column()
  ownerId: string;

  @Column()
  url: string;

  @Column()
  publicId: string;

  @Column('int', { default: 0 })
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne('Venue', 'photos', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue: Venue;
}
