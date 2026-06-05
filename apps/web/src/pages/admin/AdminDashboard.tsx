import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, CalendarCheck, TrendingUp, ShieldCheck,
  Search, Activity, CheckCircle2, XCircle, Eye, Flag,
  ChevronDown, MoreHorizontal, AlertTriangle, Wifi,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface PlatformStats {
  totalVenues: number;
  pendingVenues: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings?: number;
  cancelledBookings?: number;
}

interface PendingVenue {
  id: string;
  name: string;
  city: string;
  type: string;
  createdAt: string;
  owner?: { name: string; email: string };
}

const STATUS_FILTERS = ['All', 'Pending Review', 'Under Review', 'Escalated'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const { data, isLoading } = useQuery<PlatformStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => { const { data } = await api.get('/admin/analytics'); return data.data; },
  });

  const { data: pendingVenues } = useQuery<PendingVenue[]>({
    queryKey: ['admin-pending-venues'],
    queryFn: async () => { const { data } = await api.get('/admin/venues/pending'); return data.data; },
  });

  if (isLoading) return <div className="py-14 flex justify-center"><PageSpinner /></div>;

  const confirmRate = data?.totalBookings && data.confirmedBookings
    ? Math.round((data.confirmedBookings / data.totalBookings) * 100) : 0;

  const kpis = [
    {
      label: 'Platform Revenue',
      value: formatCurrency(data?.totalRevenue ?? 0),
      sub: 'All time',
      icon: <TrendingUp size={18} />,
      iconBg: 'bg-indigo-100 text-indigo-600',
      change: '+18%',
      changeUp: true,
    },
    {
      label: 'Total Venues',
      value: data?.totalVenues ?? 0,
      sub: `${data?.pendingVenues ?? 0} pending review`,
      icon: <Building2 size={18} />,
      iconBg: 'bg-blue-100 text-blue-600',
      badge: data?.pendingVenues,
    },
    {
      label: 'Registered Users',
      value: data?.totalUsers ?? 0,
      sub: 'Total accounts',
      icon: <Users size={18} />,
      iconBg: 'bg-violet-100 text-violet-600',
      change: '+5%',
      changeUp: true,
    },
    {
      label: 'Total Bookings',
      value: data?.totalBookings ?? 0,
      sub: `${confirmRate}% confirmed`,
      icon: <CalendarCheck size={18} />,
      iconBg: 'bg-amber-100 text-amber-600',
      bar: confirmRate,
    },
  ];

  const filtered = (pendingVenues ?? []).filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) &&
        !v.city.toLowerCase().includes(search.toLowerCase()) &&
        !(v.owner?.name ?? '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">

      {/* ── Command Bar ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Platform Control Center</h1>
          <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse-dot inline-block" />
            All systems operational
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Wifi size={13} className="text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">Live</span>
          </div>
          <div className="flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-3 py-2 shadow-sm shadow-indigo-200">
            <Activity size={13} />
            <span className="text-xs font-semibold">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* ── Pending alert ─── */}
      {(data?.pendingVenues ?? 0) > 0 && (
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-200/80 rounded-2xl px-5 py-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={14} className="text-amber-600" />
          </div>
          <p className="flex-1 text-sm font-medium text-amber-900">
            <span className="font-bold">{data?.pendingVenues}</span> venue{(data?.pendingVenues ?? 0) > 1 ? 's' : ''} awaiting review
          </p>
          <Link to="/admin/venues/pending">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 shadow-sm">Review Queue</Button>
          </Link>
        </div>
      )}

      {/* ── 4 Analytics Cards ─── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-card transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', k.iconBg)}>
                {k.icon}
              </div>
              <div className="flex items-center gap-1.5">
                {k.change && (
                  <span className={cn('text-[11px] font-bold px-1.5 py-0.5 rounded-full', k.changeUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
                    {k.change}
                  </span>
                )}
                {(k.badge ?? 0) > 0 && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {k.badge} pending
                  </span>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold text-navy leading-none mb-1">{k.value}</p>
            <p className="text-xs font-medium text-muted">{k.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{k.sub}</p>
            {k.bar !== undefined && (
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${k.bar}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Venue Verification Queue Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

        {/* Table header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-500" />
            <h2 className="font-semibold text-navy text-sm">Venue Verification Queue</h2>
            {(data?.pendingVenues ?? 0) > 0 && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {data?.pendingVenues} pending
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 sm:w-56">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search venues..."
                className="bg-transparent text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none flex-1"
              />
            </div>
            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-7 text-xs text-slate-600 focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                {STATUS_FILTERS.map(f => <option key={f}>{f}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Venue Name', 'Owner', 'Location', 'Date Submitted', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                        <ShieldCheck size={20} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-navy">No venues pending</p>
                      <p className="text-xs text-muted">All submissions have been reviewed.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 8).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Venue name */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <Building2 size={14} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-navy truncate max-w-[160px]">{v.name}</p>
                          <p className="text-[10px] text-muted capitalize">{v.type?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </td>
                    {/* Owner */}
                    <td className="px-6 py-3.5">
                      <p className="text-xs font-medium text-slate-600">{v.owner?.name ?? '—'}</p>
                      <p className="text-[10px] text-muted truncate max-w-[140px]">{v.owner?.email ?? '—'}</p>
                    </td>
                    {/* Location */}
                    <td className="px-6 py-3.5">
                      <span className="text-xs text-slate-600">{v.city}, Kerala</span>
                    </td>
                    {/* Date */}
                    <td className="px-6 py-3.5">
                      <span className="text-xs text-slate-500">
                        {new Date(v.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    {/* Status badge */}
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-dot" />
                        Pending Review
                      </span>
                    </td>
                    {/* Action buttons */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/admin/venues/pending`}>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="View Docs">
                            <Eye size={13} />
                          </button>
                        </Link>
                        <Link to={`/admin/venues/pending`}>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Approve">
                            <CheckCircle2 size={13} />
                          </button>
                        </Link>
                        <Link to={`/admin/venues/pending`}>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Flag">
                            <Flag size={13} />
                          </button>
                        </Link>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all" title="More">
                          <MoreHorizontal size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-muted">Showing {Math.min(filtered.length, 8)} of {filtered.length} venues</p>
            <Link to="/admin/venues/pending">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-indigo-600 hover:text-indigo-700">
                View full queue <ChevronDown size={11} className="rotate-[-90deg]" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* ── Platform health row ─── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-indigo-500" />
            <h3 className="font-semibold text-navy text-sm">Venue Approval Rate</h3>
            <span className="ml-auto font-bold text-sm text-navy">
              {data?.totalVenues ? `${Math.round(((data.totalVenues - (data.pendingVenues ?? 0)) / data.totalVenues) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${data?.totalVenues ? ((data.totalVenues - (data.pendingVenues ?? 0)) / data.totalVenues) * 100 : 0}%` }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Approved</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Pending ({data?.pendingVenues ?? 0})</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={14} className="text-indigo-500" />
            <h3 className="font-semibold text-navy text-sm">Booking Confirmation Rate</h3>
            <span className="ml-auto font-bold text-sm text-navy">{confirmRate}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${confirmRate}%` }} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 size={10} /> {data?.confirmedBookings ?? 0} confirmed</span>
              <span className="flex items-center gap-1 text-red-400 font-semibold"><XCircle size={10} /> {data?.cancelledBookings ?? 0} cancelled</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
