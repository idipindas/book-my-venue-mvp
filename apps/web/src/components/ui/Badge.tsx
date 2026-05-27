import { cn } from '@/lib/utils';
import { BookingStatus, VenueStatus, PaymentStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'primary' | 'muted' | 'accent';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  primary: 'bg-teal-50 text-teal-700 border-teal-200',
  muted: 'bg-slate-100 text-slate-600 border-slate-200',
  accent: 'bg-amber-50 text-amber-800 border-amber-200',
};

export function Badge({ children, variant = 'muted', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

const bookingVariantMap: Record<BookingStatus, BadgeProps['variant']> = {
  [BookingStatus.PENDING]: 'warning',
  [BookingStatus.CONFIRMED]: 'success',
  [BookingStatus.CANCELLED]: 'error',
  [BookingStatus.COMPLETED]: 'primary',
};

const venueVariantMap: Record<VenueStatus, BadgeProps['variant']> = {
  [VenueStatus.PENDING]: 'warning',
  [VenueStatus.APPROVED]: 'success',
  [VenueStatus.REJECTED]: 'error',
  [VenueStatus.INACTIVE]: 'muted',
};

const paymentVariantMap: Record<PaymentStatus, BadgeProps['variant']> = {
  [PaymentStatus.PENDING]: 'warning',
  [PaymentStatus.SUCCESS]: 'success',
  [PaymentStatus.FAILED]: 'error',
  [PaymentStatus.REFUNDED]: 'primary',
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={bookingVariantMap[status]}>{status}</Badge>;
}

export function VenueStatusBadge({ status }: { status: VenueStatus }) {
  return <Badge variant={venueVariantMap[status]}>{status}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariantMap[status]}>{status}</Badge>;
}
