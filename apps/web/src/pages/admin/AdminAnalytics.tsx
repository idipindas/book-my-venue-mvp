import { IndianRupee, Users, Building2, CalendarCheck, TrendingUp, ArrowUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import { PageSpinner } from '@/components/ui/Spinner';

interface AdminAnalyticsData {
  totalRevenue: number;
  totalUsers: number;
  totalVenues: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  revenueByType: { type: string; revenue: number; bookings: number }[];
  monthlyRevenue: { month: string; revenue: number; bookings: number }[];
}

const TYPE_LABELS: Record<string, string> = {
  birthday_hall: 'Birthday Hall',
  cafe: 'Café',
  hotel: 'Hotel',
  resort: 'Resort',
  auditorium: 'Auditorium',
  meetup: 'Meetup Space',
  mall: 'Mall',
  venue_hall: 'Venue Hall',
};

const TYPE_GRADIENTS = [
  'from-teal-500 to-emerald-500',
  'from-blue-500 to-indigo-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
];

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery<AdminAnalyticsData>({
    queryKey: ['admin-analytics'],
    queryFn: async () => { const { data } = await api.get('/admin/analytics'); return data.data; },
  });

  if (isLoading) return <div className="py-14 flex justify-center"><PageSpinner /></div>;

  const maxRevByType = Math.max(...(data?.revenueByType?.map((r) => r.revenue) ?? [1]), 1);
  const maxMonthly = Math.max(...(data?.monthlyRevenue?.map((m) => m.revenue) ?? [1]), 1);
  const confirmRate = data?.totalBookings ? Math.round((data.confirmedBookings / data.totalBookings) * 100) : 0;
  const cancelRate = data?.totalBookings ? Math.round((data.cancelledBookings / data.totalBookings) * 100) : 0;

  const stats = [
    { label: 'Platform Revenue', value: formatCurrency(data?.totalRevenue ?? 0), icon: <IndianRupee size={22} />, gradient: 'from-teal-500 to-emerald-600' },
    { label: 'Total Users', value: data?.totalUsers ?? 0, icon: <Users size={22} />, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Total Venues', value: data?.totalVenues ?? 0, icon: <Building2 size={22} />, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Total Bookings', value: data?.totalBookings ?? 0, icon: <CalendarCheck size={22} />, gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Platform Analytics</h1>
        <p className="text-sm text-muted mt-0.5">Complete overview of BookMyVenue's performance.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-5 text-white`}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              {s.icon}
            </div>
            <p className="text-2xl font-bold leading-none mb-1">{s.value}</p>
            <p className="text-sm opacity-75">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart + type breakdown */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Monthly revenue — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-navy">Monthly Revenue</h2>
              <p className="text-xs text-muted mt-0.5">Booking revenue over time</p>
            </div>
            <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <ArrowUp size={11} /> <TrendingUp size={11} /> Growing
            </div>
          </div>
          {data?.monthlyRevenue?.length ? (
            <div>
              <div className="flex items-end gap-2 h-44 mb-3">
                {data.monthlyRevenue.map((m, i) => {
                  const heightPct = Math.max((m.revenue / maxMonthly) * 100, 2);
                  const isLast = i === data.monthlyRevenue.length - 1;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative flex-1 w-full flex items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ${isLast ? 'bg-primary' : 'bg-primary/25 group-hover:bg-primary/50'}`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-navy text-white text-[9px] rounded-lg px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                          {formatCurrency(m.revenue)}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-navy" />
                        </div>
                      </div>
                      <span className="text-[9px] text-muted font-medium">{m.month.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                <span className="text-xs text-muted">Total: <strong className="text-navy">{formatCurrency(data?.totalRevenue ?? 0)}</strong></span>
                <span className="text-xs text-muted">{data.monthlyRevenue.length} months tracked</span>
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-muted text-sm">No data yet</div>
          )}
        </div>

        {/* Revenue by type — 1/3 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-navy mb-5">By Venue Type</h2>
          {data?.revenueByType?.length ? (
            <div className="space-y-4">
              {data.revenueByType.slice(0, 6).map((r, i) => (
                <div key={r.type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-navy truncate max-w-[120px]">
                      {TYPE_LABELS[r.type] ?? r.type}
                    </span>
                    <span className="text-xs font-bold text-navy">{formatCurrency(r.revenue)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${TYPE_GRADIENTS[i % TYPE_GRADIENTS.length]} rounded-full transition-all duration-700`}
                      style={{ width: `${(r.revenue / maxRevByType) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted mt-0.5">{r.bookings} bookings</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Booking health full row */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-semibold text-navy mb-5">Platform Booking Health</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { label: 'Confirmation Rate', value: confirmRate, count: data?.confirmedBookings ?? 0, color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
            { label: 'Cancellation Rate', value: cancelRate, count: data?.cancelledBookings ?? 0, color: 'bg-red-400', light: 'bg-red-50', text: 'text-red-700' },
            { label: 'Pending / Other', value: Math.max(0, 100 - confirmRate - cancelRate), count: (data?.totalBookings ?? 0) - (data?.confirmedBookings ?? 0) - (data?.cancelledBookings ?? 0), color: 'bg-amber-400', light: 'bg-amber-50', text: 'text-amber-700' },
          ].map((item) => (
            <div key={item.label} className={`${item.light} rounded-2xl p-5`}>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">{item.label}</p>
                  <p className={`text-3xl font-black ${item.text}`}>{item.value}%</p>
                </div>
                <p className="text-sm text-slate-500 font-medium">{item.count} bookings</p>
              </div>
              <div className="h-2.5 bg-white/70 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(item.value, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
