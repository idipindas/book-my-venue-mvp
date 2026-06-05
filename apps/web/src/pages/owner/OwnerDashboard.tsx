import { Link } from 'react-router-dom';
import {
  Building2, CalendarCheck, TrendingUp, Clock, ArrowRight,
  Plus, IndianRupee, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  Star, AlertCircle, Bell,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookingStatus } from '@/types';
import { cn } from '@/lib/utils';

interface OwnerAnalytics {
  totalVenues: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings?: number;
}

interface OwnerBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  totalAmount: number;
  status: BookingStatus;
  venue?: { name: string };
  user?: { name: string };
}

function useOwnerAnalytics() {
  return useQuery<OwnerAnalytics>({
    queryKey: ['owner-analytics'],
    queryFn: async () => { const { data } = await api.get('/owner/analytics'); return data.data; },
  });
}

function useOwnerBookings() {
  return useQuery<OwnerBooking[]>({
    queryKey: ['owner-bookings'],
    queryFn: async () => { const { data } = await api.get('/owner/bookings'); return data.data; },
  });
}

/* ── Mini Sparkline ─────────────────────────────────────────────── */
function Sparkline({ color }: { color: string }) {
  const points = [20, 35, 28, 45, 38, 55, 48, 62];
  const max = Math.max(...points);
  const w = 64; const h = 24;
  const pts = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      <circle cx={(7 / 7) * w} cy={h - (points[7] / max) * h} r="2.5" fill={color} />
    </svg>
  );
}

/* ── Mini Calendar ──────────────────────────────────────────────── */
function BookingCalendar({ bookings }: { bookings: OwnerBooking[] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const bookingMap = new Map<string, BookingStatus[]>();
  bookings.forEach((b) => {
    const existing = bookingMap.get(b.date) ?? [];
    bookingMap.set(b.date, [...existing, b.status]);
  });

  const days = Array.from({ length: firstDay }, (_, i) => ({ day: 0, key: `e${i}` }))
    .concat(Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, key: `d${i + 1}` })));

  const fmtKey = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-navy text-sm">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-navy transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-navy transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-muted uppercase">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map(({ day, key }) => {
          if (!day) return <div key={key} />;
          const dateKey = fmtKey(day);
          const statuses = bookingMap.get(dateKey) ?? [];
          const hasConfirmed = statuses.includes(BookingStatus.CONFIRMED);
          const hasPending = statuses.includes(BookingStatus.PENDING);
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

          return (
            <div key={key} className={cn(
              'relative flex flex-col items-center justify-center h-8 rounded-lg text-xs font-medium transition-colors',
              isToday ? 'bg-primary text-white font-bold' : 'hover:bg-slate-50 text-slate-600',
            )}>
              {day}
              {(hasConfirmed || hasPending) && (
                <div className="absolute bottom-0.5 flex gap-0.5">
                  {hasConfirmed && <span className="w-1 h-1 rounded-full bg-blue-500 block" />}
                  {hasPending && <span className="w-1 h-1 rounded-full bg-orange-400 block" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
        <span className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="w-2 h-2 rounded-full bg-blue-500 block" /> Confirmed
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="w-2 h-2 rounded-full bg-orange-400 block" /> Tentative
        </span>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const { data: analytics } = useOwnerAnalytics();
  const { data: bookings } = useOwnerBookings();

  const recent = bookings?.slice(0, 5) ?? [];
  const pending = bookings?.filter((b) => b.status === BookingStatus.PENDING) ?? [];
  const pendingCount = pending.length;

  const microCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(analytics?.totalRevenue ?? 0),
      sub: '+12% this month',
      icon: <IndianRupee size={16} />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      spark: <Sparkline color="#10B981" />,
      accent: 'border-l-emerald',
    },
    {
      label: 'New Inquiries',
      value: pendingCount,
      sub: pendingCount > 0 ? 'Needs response' : 'All clear',
      icon: <Bell size={16} />,
      iconBg: pendingCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500',
      dot: pendingCount > 0,
      accent: 'border-l-amber',
    },
    {
      label: 'Occupancy Rate',
      value: analytics?.totalBookings
        ? `${Math.min(Math.round((analytics.confirmedBookings ?? 0) / Math.max(analytics.totalBookings, 1) * 100), 100)}%`
        : '0%',
      sub: 'Calendar fill rate',
      icon: <CalendarCheck size={16} />,
      iconBg: 'bg-blue-50 text-blue-600',
      accent: 'border-l-blue',
    },
    {
      label: 'Avg. Rating',
      value: '4.8',
      sub: 'Based on reviews',
      icon: <Star size={16} />,
      iconBg: 'bg-violet-50 text-violet-600',
      accent: 'border-l-violet',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted mt-0.5">Here's your venue performance at a glance.</p>
        </div>
        <Link to="/owner/venues/new">
          <Button size="sm" className="gap-1.5 shrink-0 shadow-sm shadow-primary/20">
            <Plus size={14} /> New Venue
          </Button>
        </Link>
      </div>

      {/* ── 4 Micro-card Summary Ribbon ─── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {microCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-card transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center relative', card.iconBg)}>
                {card.icon}
                {card.dot && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white animate-pulse-dot" />
                )}
              </div>
              {card.spark}
            </div>
            <p className="text-xl font-bold text-navy leading-none mb-1">{card.value}</p>
            <p className="text-xs font-medium text-muted">{card.label}</p>
            {card.sub && <p className="text-[10px] text-slate-400 mt-0.5">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Pending Alert ─── */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-200/80 rounded-2xl px-5 py-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle size={16} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">{pendingCount} booking{pendingCount > 1 ? 's' : ''} awaiting your response</p>
            <p className="text-xs text-amber-700 mt-0.5">Respond within 2 hours to maintain your acceptance rate.</p>
          </div>
          <Link to="/owner/bookings">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">Review</Button>
          </Link>
        </div>
      )}

      {/* ── Main Split: Calendar (65%) + Quick Actions (35%) ─── */}
      <div className="grid lg:grid-cols-[1fr_auto] gap-5" style={{ gridTemplateColumns: '1fr minmax(0, 35%)' }}>

        {/* Calendar panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-navy text-sm flex items-center gap-2">
              <CalendarCheck size={15} className="text-primary" />
              Booking Calendar
            </h2>
            <Link to="/owner/bookings">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary hover:text-primary">
                All bookings <ArrowRight size={12} />
              </Button>
            </Link>
          </div>
          <div className="p-6">
            <BookingCalendar bookings={bookings ?? []} />

            {/* Recent bookings list below calendar */}
            {recent.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Recent Activity</p>
                <div className="space-y-2">
                  {recent.slice(0, 4).map((b) => (
                    <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{new Date(b.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-navy truncate">{b.venue?.name}</p>
                        <p className="text-[11px] text-muted">{b.user?.name ?? 'Guest'} · {b.startTime}–{b.endTime}</p>
                      </div>
                      <BookingStatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions + Inquiries */}
        <div className="space-y-4 min-w-0">

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h2 className="font-semibold text-navy text-sm">Quick Actions</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { to: '/owner/venues/new', icon: <Plus size={14} className="text-accent" />, iconBg: 'bg-rose-50', label: 'Add New Venue', sub: 'Submit for review' },
                { to: '/owner/venues', icon: <Building2 size={14} className="text-blue-500" />, iconBg: 'bg-blue-50', label: 'Manage Venues', sub: `${analytics?.totalVenues ?? 0} venues` },
                { to: '/owner/bookings', icon: <CalendarCheck size={14} className="text-violet-500" />, iconBg: 'bg-violet-50', label: 'All Bookings', sub: pendingCount > 0 ? `${pendingCount} pending` : 'Up to date' },
                { to: '/owner/availability', icon: <Clock size={14} className="text-amber-500" />, iconBg: 'bg-amber-50', label: 'Time Slots', sub: 'Set open hours' },
                { to: '/owner/analytics', icon: <TrendingUp size={14} className="text-emerald-500" />, iconBg: 'bg-emerald-50', label: 'Analytics', sub: 'Revenue & trends' },
              ].map((a) => (
                <Link key={a.to} to={a.to} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', a.iconBg)}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-navy">{a.label}</p>
                    <p className="text-[10px] text-muted">{a.sub}</p>
                  </div>
                  <ChevronRight size={13} className="text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent inquiries — pending bookings */}
          {pending.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-navy text-sm">Recent Inquiries</h2>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {pending.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-4 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary text-xs font-bold">
                        {b.user?.name?.charAt(0) ?? 'G'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-navy truncate">{b.user?.name ?? 'Guest'}</p>
                        <p className="text-[10px] text-muted">{b.venue?.name} · {formatDate(b.date)}</p>
                        <p className="text-[10px] text-muted">{b.startTime}–{b.endTime} · {b.guestCount} guests</p>
                      </div>
                      <span className="text-xs font-bold text-emerald shrink-0">{formatCurrency(b.totalAmount)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to="/owner/bookings" className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary hover:text-white transition-all">
                          <CheckCircle2 size={11} /> Accept
                        </button>
                      </Link>
                      <Link to="/owner/bookings" className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-semibold hover:bg-red-50 hover:text-red-500 transition-all">
                          <XCircle size={11} /> Decline
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
