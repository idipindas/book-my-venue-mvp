import { IsDateString, IsInt, IsString, IsUUID, Min, Matches } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  venueId: string;

  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be HH:MM' })
  startTime: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be HH:MM' })
  endTime: string;

  @IsInt()
  @Min(1)
  guestCount: number;
}
