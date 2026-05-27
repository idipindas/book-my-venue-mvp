import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from '@/store/ui.store';
import type { Booking, ApiResponse } from '@/types';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () =>
      api
        .get<{ success: boolean; data: Booking[] }>('/bookings')
        .then((r) => r.data.data),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () =>
      api.get<ApiResponse<Booking>>(`/bookings/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      venueId: string;
      date: string;
      startTime: string;
      endTime: string;
      guestCount: number;
    }) =>
      api
        .post<ApiResponse<Booking>>('/bookings', data)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created! Complete payment to confirm.');
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) =>
      toast.error(err?.response?.data?.error?.message ?? 'Booking failed.'),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled.');
    },
    onError: () => toast.error('Could not cancel booking.'),
  });
}
