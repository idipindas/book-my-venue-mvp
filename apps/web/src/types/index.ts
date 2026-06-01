export enum Role {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

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

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VenuePhoto {
  id: string;
  venueId: string;
  ownerId: string;
  url: string;
  publicId: string;
  position: number;
  createdAt: string;
}

export interface Venue {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  type: VenueType;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  capacityMin: number;
  capacityMax: number;
  pricePerHour: number | null;
  priceHalfDay: number | null;
  priceFullDay: number | null;
  amenities: string[];
  photos: VenuePhoto[];
  status: VenueStatus;
  rejectedNote: string | null;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  time: string;
  available: boolean;
}

export interface Availability {
  id: string;
  venueId: string;
  date: string;
  slots: Slot[];
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  gatewayId: string | null;
  status: PaymentStatus;
  refundId: string | null;
  refundedAt: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  totalAmount: number;
  status: BookingStatus;
  cancelledAt: string | null;
  cancelReason: string | null;
  venue?: Venue;
  user?: User;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  [VenueType.BIRTHDAY_HALL]: 'Birthday Hall',
  [VenueType.CAFE]: 'Café',
  [VenueType.HOTEL]: 'Hotel',
  [VenueType.RESORT]: 'Resort',
  [VenueType.AUDITORIUM]: 'Auditorium',
  [VenueType.MEETUP]: 'Meetup Space',
  [VenueType.MALL]: 'Mall Space',
  [VenueType.VENUE_HALL]: 'Venue Hall',
};
