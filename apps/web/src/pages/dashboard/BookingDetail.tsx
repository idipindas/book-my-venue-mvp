import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, MapPin, IndianRupee, Hash } from 'lucide-react';
import { useBooking, useCancelBooking } from '@/hooks/useBookings';
import { BookingStatus } from '@/types';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading } = useBooking(id!);
  const { mutate: cancel, isPending } = useCancelBooking();

  if (isLoading) return <div className="py-12"><PageSpinner /></div>;
  if (!booking) return (
    <div className="py-20 text-center">
      <p className="text-muted">Booking not found.</p>
      <Link to="/dashboard/bookings" className="mt-4 inline-block">
        <Button variant="outline" size="sm">Back to bookings</Button>
      </Link>
    </div>
  );

  const details = [
    { icon: <Hash size={15} />, label: 'Booking ID', value: booking.id.slice(0, 8).toUpperCase() },
    { icon: <Calendar size={15} />, label: 'Date', value: formatDate(booking.date) },
    { icon: <Clock size={15} />, label: 'Time', value: `${booking.startTime} – ${booking.endTime}` },
    { icon: <Users size={15} />, label: 'Guests', value: `${booking.guestCount} people` },
    { icon: <MapPin size={15} />, label: 'Venue', value: booking.venue?.name ?? '—' },
    { icon: <IndianRupee size={15} />, label: 'Total Amount', value: formatCurrency(booking.totalAmount) },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back link */}
      <Link
        to="/dashboard/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft size={15} /> Back to bookings
      </Link>

      {/* Header card */}
      <div className="bg-teal-gradient rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-1">Booking</p>
            <p className="font-mono text-sm text-white/80">#{booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
        <h1 className="font-display text-2xl font-semibold">{booking.venue?.name ?? 'Venue'}</h1>
        <p className="text-white/70 text-sm mt-1">{formatDate(booking.date)} · {booking.startTime} – {booking.endTime}</p>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-navy text-sm">Booking Details</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {details.map((d) => (
            <div key={d.label} className="flex items-center justify-between px-5 py-3.5">
              <span className="flex items-center gap-2 text-sm text-muted">{d.icon}{d.label}</span>
              <span className="text-sm font-semibold text-navy">{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment card */}
      {booking.payment && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-navy text-sm">Payment</h2>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-muted">Payment Status</span>
            <PaymentStatusBadge status={booking.payment.status} />
          </div>
        </div>
      )}

      {/* Cancellation info */}
      {booking.cancelledAt && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <p className="text-sm font-semibold text-error mb-0.5">
            Cancelled on {formatDateTime(booking.cancelledAt)}
          </p>
          {booking.cancelReason && (
            <p className="text-sm text-red-600/80">{booking.cancelReason}</p>
          )}
        </div>
      )}

      {/* Cancel action */}
      {booking.status === BookingStatus.PENDING && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm text-muted mb-3">
            Need to cancel? Refunds are subject to our cancellation policy.
          </p>
          <Button
            variant="danger"
            loading={isPending}
            onClick={() => cancel(booking.id)}
            className="gap-2"
          >
            Cancel This Booking
          </Button>
        </div>
      )}
    </div>
  );
}
