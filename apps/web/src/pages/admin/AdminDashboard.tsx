import { Link } from 'react-router-dom';
import {
  Building2, Users, CalendarCheck, TrendingUp, ShieldCheck,
  ArrowRight, Activity, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';

interface PlatformStats {
  totalVenues: number;
  pendingVenues: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings?: number;
  cancelledBookings?: number;
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<PlatformStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => { const { data } = await api.get('/admin/analytics'); return data.data; },
  });

  if (isLoading) return <div className="py-14 flex justify-center"><PageSpinner /></div>;

  const confirmRate = data?.totalBookings && data.confirmedBookings
    ? Math.round((data.confirmedBookings / data.totalBookings) * 100)
    : 0;

  const kpis = [
    {
      label: 'Platform Revenue',
      value: formatCurrency(data?.totalRevenue ?? 0),
      icon: <TrendingUp size={22} />,
      gradient: 'from-teal-500 to-emerald-600',
      href: '/admin/analytics',
      sub: 'All time',
    },
    {
      label: 'Total Venues',
      value: data?.totalVenues ?? 0,
      icon: <Building2 size={22} />,
      gradient: 'from-blue-500 to-indigo-600',
      href: '/admin/venues/pending',
      sub: `${data?.pendingVenues ?? 0} pending`,
    },
    {
      label: 'Registered Users',
      value: data?.totalUsers ?? 0,
      icon: <Users size={22} />,
      gradient: 'from-violet-500 to-purple-600',
      href: '/admin/users',
      sub: 'Total accounts',
    },
    {
      label: 'Total Bookings',
      value: data?.totalBookings ?? 0,
      icon: <CalendarCheck size={22} />,
      gradient: 'from-amber-500 to-orange-500',
      href: '/admin/analytics',
      sub: `${confirmRate}% confirmed`,
    },
  ];

  const actions = [
    {
      to: '/admin/venues/pending',
      icon: <ShieldCheck size={20} className="text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
      label: 'Review Pending Venues',
      sub: data?.pendingVenues ? `${data.pendingVenues} venues awaiting approval` : 'No venues pending',
      badge: data?.pendingVenues ?? 0,
      badgeColor: 'bg-amber-500',
    },
    {
      to: '/admin/users',
      icon: <Users size={20} className="text-violet-600" />,
      bg: 'bg-violet-50 border-violet-100',
      label: 'Manage Users',
      sub: `${data?.totalUsers ?? 0} registered accounts`,
      badge: 0,
      badgeColor: '',
    },
    {
      to: '/admin/analytics',
      icon: <TrendingUp size={20} className="text-teal-600" />,
      bg: 'bg-teal-50 border-teal-100',
      label: 'Platform Analytics',
      sub: 'Revenue, bookings & trends',
      badge: 0,
      badgeColor: '',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Platform Overview</h1>
        <p className="text-sm text-muted mt-0.5">BookMyVenue admin dashboard — real-time platform health.</p>
      </div>

      {/* Pending alert */}
      {(data?.pendingVenues ?? 0) > 0 && (
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              {data?.pendingVenues} venue{(data?.pendingVenues ?? 0) > 1 ? 's' : ''} need review
            </p>
            <p className="text-xs text-amber-700 mt-0.5">Review and approve or reject pending submissions.</p>
          </div>
          <Link to="/admin/venues/pending" className="shrink-0">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Review Now</Button>
          </Link>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            to={k.href}
            className={`bg-gradient-to-br ${k.gradient} rounded-2xl p-5 text-white group hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                {k.icon}
              </div>
              <ArrowRight size={15} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold leading-none mb-1">{k.value}</p>
            <p className="text-sm opacity-80">{k.label}</p>
            <p className="text-xs opacity-60 mt-0.5">{k.sub}</p>
          </Link>
        ))}
      </div>

      {/* Two column */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Platform health — 3/5 */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            <h2 className="font-semibold text-navy">Platform Health</h2>
          </div>
          <div className="p-6 space-y-5">
            {/* Venue status breakdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-navy">Venue Approval Rate</span>
                <span className="text-sm font-bold text-navy">
                  {data?.totalVenues
                    ? `${Math.round(((data.totalVenues - (data.pendingVenues ?? 0)) / data.totalVenues) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${data?.totalVenues ? ((data.totalVenues - (data.pendingVenues ?? 0)) / data.totalVenues) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-xs text-muted">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Approved</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Pending ({data?.pendingVenues ?? 0})</span>
              </div>
            </div>

            {/* Booking health */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-navy">Booking Confirmation Rate</span>
                <span className="text-sm font-bold text-navy">{confirmRate}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${confirmRate}%` }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: 'Confirmed Bookings', value: data?.confirmedBookings ?? 0, icon: <CheckCircle2 size={14} className="text-emerald-500" />, bg: 'bg-emerald-50' },
                { label: 'Cancelled Bookings', value: data?.cancelledBookings ?? 0, icon: <XCircle size={14} className="text-red-400" />, bg: 'bg-red-50' },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl p-4 flex items-center gap-3`}>
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-navy leading-none">{item.value}</p>
                    <p className="text-xs text-muted mt-0.5">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin actions — 2/5 */}
        <div className="lg:col-span-2 space-y-3">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className={`flex items-center gap-4 p-5 rounded-2xl border ${a.bg} hover:scale-[1.01] transition-transform group`}
            >
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy text-sm truncate">{a.label}</p>
                <p className="text-xs text-muted mt-0.5">{a.sub}</p>
              </div>
              {a.badge > 0 && (
                <span className={`${a.badgeColor} text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0`}>
                  {a.badge}
                </span>
              )}
              <ArrowRight size={15} className="text-slate-300 group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
