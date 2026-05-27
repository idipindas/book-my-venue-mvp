import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, X, MapPin, Filter } from 'lucide-react';
import { useBookings, useCancelBooking } from '@/hooks/useBookings';
import { BookingStatus } from '@/types';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';

const tabs = [
  { key: 'upcoming', label: 'Upcoming', statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
  { key: 'past', label: 'Past', statuses: [BookingStatus.COMPLETED] },
  { key: 'cancelled', label: 'Cancelled', statuses: [BookingStatus.CANCELLED] },
];

const statusDotColor: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'bg-amber-400',
  [BookingStatus.CONFIRMED]: 'bg-emerald-500',
  [BookingStatus.CANCELLED]: 'bg-red-400',
  [BookingStatus.COMPLETED]: 'bg-blue-400',
};

export default function Bookings() {
  const { data: bookings, isLoading } = useBookings();
  const { mutate: cancel, isPending: cancelling } = useCancelBooking();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelId, setCancelId] = useState<string | null>(null);

  const filtered = bookings?.filter((b) =>
    tabs.find((t) => t.key === activeTab)?.statuses.includes(b.status)
  ) ?? [];

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Bookings</h1>
          <p className="text-sm text-muted mt-0.5">{bookings?.length ?? 0} total</p>
        </div>
        <Link to="/venues">
          <Button size="sm" variant="outline" className="gap-1.5">
            <MapPin size={14} /> New Booking
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm w-fit">
        {tabs.map((t) => {
          const count = bookings?.filter((b) => t.statuses.includes(b.status)).length ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'px-5 py-2.5 text-sm font-medium transition-all border-r border-slate-200 last:border-r-0',
                activeTab === t.key
                  ? 'bg-navy text-white'
                  : 'text-slate-500 hover:text-navy hover:bg-slate-50'
              )}
            >
              {t.label}
              {bookings && (
                <span className={cn(
                  'ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold',
                  activeTab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-14 flex justify-center"><PageSpinner /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 flex flex-col items-center text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-5">
            <CalendarDays size={32} className="text-slate-300" />
          </div>
          <p className="font-semibold text-navy mb-1.5">No {activeTab} bookings</p>
          <p className="text-sm text-muted mb-6">
            {activeTab === 'upcoming' ? 'Find a venue and make your first booking.' : `Your ${activeTab} bookings will appear here.`}
          </p>
          {activeTab === 'upcoming' && (
            <Link to="/venues"><Button size="sm">Browse Venues</Button></Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-stretch">
                {/* Left color bar */}
                <div className={`w-1 shrink-0 ${statusDotColor[b.status]}`} />

                <div className="flex items-center gap-4 p-5 flex-1 min-w-0">
                  {/* Date block */}
                  <div className="shrink-0 w-14 text-center bg-slate-50 rounded-xl py-2.5 px-1 border border-slate-100">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wide">
                      {new Date(b.date).toLocaleString('en', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-black text-navy leading-tight">
                      {new Date(b.date).getDate()}
                    </p>
                    <p className="text-[10px] text-muted">
                      {new Date(b.date).toLocaleString('en', { weekday: 'short' })}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-navy truncate">{b.venue?.name ?? 'Venue'}</p>
                    </div>
                    <p className="text-sm text-muted mb-1">
                      {b.startTime}–{b.endTime} · {b.guestCount} guests
                    </p>
                    <div className="flex items-center gap-2">
                      <BookingStatusBadge status={b.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted">Amount</p>
                      <p className="font-bold text-navy">{formatCurrency(b.totalAmount)}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {b.status === BookingStatus.PENDING && (
                        <button
                          onClick={() => setCancelId(b.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        >
                          <X size={11} /> Cancel
                        </button>
                      )}
                      <Link to={`/dashboard/bookings/${b.id}`}>
                        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-slate-200 w-full justify-center">
                          Details <ChevronRight size={11} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Booking" size="sm">
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl mb-5">
          <X size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            Cancellation refunds depend on how far in advance you cancel. Cancellations within 12 hours receive no refund.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setCancelId(null)}>Keep Booking</Button>
          <Button
            variant="danger"
            fullWidth
            loading={cancelling}
            onClick={() => { cancel(cancelId!); setCancelId(null); }}
          >
            Yes, Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
