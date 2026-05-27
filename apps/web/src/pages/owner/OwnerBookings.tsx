import { useState } from 'react';
import { CalendarCheck, Check, X, Clock, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { BookingStatus } from '@/types';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { toast } from '@/store/ui.store';

interface OwnerBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  venue?: { name: string };
  user?: { name: string; email: string };
}

const tabs = [
  { key: 'pending', label: 'Pending', status: BookingStatus.PENDING },
  { key: 'confirmed', label: 'Confirmed', status: BookingStatus.CONFIRMED },
  { key: 'all', label: 'All Bookings', status: null },
];

const statusBg: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'border-l-amber-400',
  [BookingStatus.CONFIRMED]: 'border-l-emerald-500',
  [BookingStatus.CANCELLED]: 'border-l-red-400',
  [BookingStatus.COMPLETED]: 'border-l-blue-400',
};

export default function OwnerBookings() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  const { data: bookings, isLoading } = useQuery<OwnerBooking[]>({
    queryKey: ['owner-bookings'],
    queryFn: async () => { const { data } = await api.get('/owner/bookings'); return data.data; },
  });

  const { mutate: accept, isPending: accepting } = useMutation({
    mutationFn: (id: string) => api.patch(`/owner/bookings/${id}/accept`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-bookings'] }); toast.success('Booking accepted'); },
    onError: () => toast.error('Failed to accept'),
  });

  const { mutate: decline, isPending: declining } = useMutation({
    mutationFn: (id: string) => api.patch(`/owner/bookings/${id}/decline`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-bookings'] }); toast.success('Booking declined'); },
    onError: () => toast.error('Failed to decline'),
  });

  const filtered = bookings?.filter((b) => {
    const tab = tabs.find((t) => t.key === activeTab);
    return !tab?.status || b.status === tab.status;
  }) ?? [];

  const pendingCount = bookings?.filter((b) => b.status === BookingStatus.PENDING).length ?? 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Bookings</h1>
        <p className="text-sm text-muted mt-0.5">{bookings?.length ?? 0} total · {pendingCount} pending response</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm w-fit">
        {tabs.map((t) => {
          const count = bookings?.filter((b) => !t.status || b.status === t.status).length ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'px-5 py-2.5 text-sm font-medium transition-all border-r border-slate-200 last:border-r-0 relative',
                activeTab === t.key ? 'bg-navy text-white' : 'text-slate-500 hover:text-navy hover:bg-slate-50'
              )}
            >
              {t.label}
              <span className={cn(
                'ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold',
                activeTab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              )}>
                {count}
              </span>
              {t.key === 'pending' && pendingCount > 0 && activeTab !== 'pending' && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Booking list */}
      {isLoading ? (
        <div className="py-14 flex justify-center"><PageSpinner /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 flex flex-col items-center text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
            <CalendarCheck size={26} className="text-slate-300" />
          </div>
          <p className="font-semibold text-navy mb-1">No {activeTab === 'all' ? '' : activeTab} bookings</p>
          <p className="text-xs text-muted">Bookings will appear here once customers reserve your venues.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${statusBg[b.status]} shadow-sm overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Date */}
                  <div className="shrink-0 w-14 text-center bg-slate-50 rounded-xl py-2.5 border border-slate-100">
                    <p className="text-[10px] text-primary font-bold uppercase">
                      {new Date(b.date).toLocaleString('en', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-black text-navy leading-tight">
                      {new Date(b.date).getDate()}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-navy">{b.venue?.name ?? 'Venue'}</span>
                      <BookingStatusBadge status={b.status} />
                    </div>
                    <p className="text-sm text-muted mb-0.5">
                      {b.user?.name ?? 'Guest'} · {b.user?.email}
                    </p>
                    <p className="text-sm text-muted">
                      {b.startTime}–{b.endTime} · {b.guestCount} guests
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-navy">{formatCurrency(b.totalAmount)}</p>
                    <p className="text-xs text-muted">{formatDate(b.date)}</p>
                  </div>
                </div>

                {b.status === BookingStatus.PENDING && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      loading={declining}
                      onClick={() => decline(b.id)}
                      className="flex-1 gap-1.5 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <X size={14} /> Decline
                    </Button>
                    <Button
                      size="sm"
                      loading={accepting}
                      onClick={() => accept(b.id)}
                      className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check size={14} /> Accept Booking
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
