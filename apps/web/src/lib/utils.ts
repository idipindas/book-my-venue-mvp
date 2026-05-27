import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookingStatus, VenueStatus, PaymentStatus } from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getBookingStatusColor(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'warning',
    [BookingStatus.CONFIRMED]: 'success',
    [BookingStatus.CANCELLED]: 'error',
    [BookingStatus.COMPLETED]: 'primary',
  };
  return map[status];
}

export function getVenueStatusColor(status: VenueStatus): string {
  const map: Record<VenueStatus, string> = {
    [VenueStatus.PENDING]: 'warning',
    [VenueStatus.APPROVED]: 'success',
    [VenueStatus.REJECTED]: 'error',
    [VenueStatus.INACTIVE]: 'muted',
  };
  return map[status];
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'warning',
    [PaymentStatus.SUCCESS]: 'success',
    [PaymentStatus.FAILED]: 'error',
    [PaymentStatus.REFUNDED]: 'primary',
  };
  return map[status];
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

export function getVenuePlaceholderGradient(name: string): string {
  const gradients = [
    'from-teal-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}
