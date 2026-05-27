import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVenueDto, UpdateVenueDto } from '../venues/venues.dto';

export { CreateVenueDto, UpdateVenueDto };

export class SlotDto {
  @IsString()
  time: string;

  @IsBoolean()
  available: boolean;
}

export class SetAvailabilityDto {
  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots: SlotDto[];
}

export class VenueStatusDto {
  @IsString()
  status: 'APPROVED' | 'INACTIVE';
}

export class DeclineBookingDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
