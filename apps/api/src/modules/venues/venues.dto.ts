import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { VenueType } from '../../entities/Venue.entity';

export class CreateVenueDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(VenueType)
  type: VenueType;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @Min(1)
  capacityMin: number;

  @IsNumber()
  @Min(1)
  capacityMax: number;

  @IsNumber()
  @IsOptional()
  pricePerHour?: number;

  @IsNumber()
  @IsOptional()
  priceHalfDay?: number;

  @IsNumber()
  @IsOptional()
  priceFullDay?: number;

  @IsArray()
  @IsString({ each: true })
  amenities: string[];
}

export class UpdateVenueDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(VenueType)
  @IsOptional()
  type?: VenueType;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacityMin?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacityMax?: number;

  @IsNumber()
  @IsOptional()
  pricePerHour?: number;

  @IsNumber()
  @IsOptional()
  priceHalfDay?: number;

  @IsNumber()
  @IsOptional()
  priceFullDay?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}
