import { Link } from 'react-router-dom';
import {
  Building2, CalendarCheck, TrendingUp, Clock, ArrowRight,
  Plus, IndianRupee, CheckCircle2, AlertCircle, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { BookingStatus } from '@/types';

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

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const { data: analytics } = useOwnerAnalytics();
  const { data: bookings, isLoading } = useOwnerBookings();

  const recent = bookings?.slice(0, 6) ?? [];
  const pending = bookings?.filter((b) => b.status === BookingStatus.PENDING).length ?? 0;

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(analytics?.totalRevenue ?? 0),
      icon: <IndianRupee size={22} />,
      gradient: 'from-teal-500 to-emerald-600',
      href: '/owner/analytics',
    },
    {
      label: 'My Venues',
      value: analytics?.totalVenues ?? 0,
      icon: <Building2 size={22} />,
      gradient: 'from-blue-500 to-indigo-600',
      href: '/owner/venues',
    },
    {
      label: 'Total Bookings',
      value: analytics?.totalBookings ?? 0,
      icon: <CalendarCheck size={22} />,
      gradient: 'from-violet-500 to-purple-600',
      href: '/owner/bookings',
    },
    {
      label: 'Pending Actions',
      value: pending,
      icon: <Clock size={22} />,
      gradient: pending > 0 ? 'from-amber-500 to-orange-500' : 'from-slate-400 to-slate-500',
      href: '/owner/bookings',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-sm text-muted mt-0.5">Here's how your venues are doing today.</p>
        </div>
        <Link to="/owner/venues/new">
          <Button className="gap-2 shrink-0">
            <Plus size={15} /> Add Venue
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.href}
            className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-5 text-white group hover:scale-[1.02] transition-transform cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                {s.icon}
              </div>
              <ArrowRight size={15} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-2xl font-bold leading-none mb-1">{s.value}</p>
            <p className="text-sm opacity-75">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Pending alert */}
      {pending > 0 && (
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              {pending} booking{pending > 1 ? 's' : ''} awaiting your response
            </p>
            <p className="text-xs text-amber-700 mt-0.5">Respond promptly to keep your acceptance rate high.</p>
          </div>
          <Link to="/owner/bookings" className="shrink-0">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
              Review Now
            </Button>
          </Link>
        </div>
      )}

      {/* Two column layout */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent bookings — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-navy flex items-center gap-2">
              <CalendarCheck size={16} className="text-primary" />
              Recent Bookings
            </h2>
            <Link to="/owner/bookings">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary text-xs">
                View all <ArrowRight size={13} />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center"><PageSpinner /></div>
          ) : recent.length === 0 ? (
            <div className="py-14 flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                <CalendarCheck size={26} className="text-slate-300" />
              </div>
              <p className="font-semibold text-navy text-sm mb-1">No bookings yet</p>
              <p className="text-xs text-muted">Get your venues approved to start receiving bookings.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {new Date(b.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{b.venue?.name}</p>
                    <p className="text-xs text-muted">{b.user?.name ?? 'Guest'} · {b.startTime}–{b.endTime}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-navy hidden sm:block">{formatCurrency(b.totalAmount)}</span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions — 1/3 */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-navy text-sm">Quick Actions</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { to: '/owner/venues/new', icon: <Plus size={16} className="text-primary" />, label: 'Add New Venue', sub: 'Submit for review' },
                { to: '/owner/venues', icon: <Building2 size={16} className="text-blue-500" />, label: 'Manage Venues', sub: `${analytics?.totalVenues ?? 0} venues` },
                { to: '/owner/bookings', icon: <CalendarCheck size={16} className="text-violet-500" />, label: 'View Bookings', sub: pending > 0 ? `${pending} pending` : 'All bookings' },
                { to: '/owner/availability', icon: <Clock size={16} className="text-amber-500" />, label: 'Manage Time Slots', sub: 'Set open hours per date' },
                { to: '/owner/analytics', icon: <TrendingUp size={16} className="text-emerald-500" />, label: 'Analytics', sub: 'Revenue & trends' },
              ].map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy">{a.label}</p>
                    <p className="text-xs text-muted">{a.sub}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
