import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Venue, Availability, PaginatedResponse, ApiResponse } from '@/types';

export interface VenueFilters {
  type?: string;
  city?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
  page?: number;
  limit?: number;
}

export function useVenues(filters: VenueFilters = {}) {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: () =>
      api
        .get<PaginatedResponse<Venue>>('/venues', { params: filters })
        .then((r) => r.data),
  });
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: () =>
      api.get<ApiResponse<Venue>>(`/venues/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useVenueAvailability(id: string, date: string) {
  return useQuery({
    queryKey: ['venue-availability', id, date],
    queryFn: () =>
      api
        .get<ApiResponse<Availability>>(`/venues/${id}/availability`, { params: { date } })
        .then((r) => r.data.data),
    enabled: !!id && !!date,
  });
}

export function useNearbyVenues(lat: number, lng: number, radius = 10) {
  return useQuery({
    queryKey: ['venues-nearby', lat, lng, radius],
    queryFn: () =>
      api
        .get<{ success: boolean; data: Venue[] }>('/venues/nearby', {
          params: { lat, lng, radius },
        })
        .then((r) => r.data.data),
    enabled: !!lat && !!lng,
  });
}
