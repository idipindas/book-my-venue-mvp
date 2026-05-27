import { IndianRupee, CalendarCheck, Building2, TrendingUp, ArrowUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import { PageSpinner } from '@/components/ui/Spinner';

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  totalVenues: number;
  confirmedBookings: number;
  cancelledBookings: number;
  revenueByVenue: { venueName: string; revenue: number; bookings: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export default function Analytics() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['owner-analytics-detail'],
    queryFn: async () => { const { data } = await api.get('/owner/analytics'); return data.data; },
  });

  if (isLoading) return <div className="py-14 flex justify-center"><PageSpinner /></div>;

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(data?.totalRevenue ?? 0),
      icon: <IndianRupee size={22} />,
      gradient: 'from-teal-500 to-emerald-600',
    },
    {
      label: 'Total Bookings',
      value: data?.totalBookings ?? 0,
      icon: <CalendarCheck size={22} />,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      label: 'Active Venues',
      value: data?.totalVenues ?? 0,
      icon: <Building2 size={22} />,
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      label: 'Confirmed',
      value: data?.confirmedBookings ?? 0,
      icon: <TrendingUp size={22} />,
      gradient: 'from-emerald-500 to-teal-600',
    },
  ];

  const maxRevenue = Math.max(...(data?.revenueByVenue?.map((v) => v.revenue) ?? [1]), 1);
  const maxMonthly = Math.max(...(data?.monthlyRevenue?.map((m) => m.revenue) ?? [1]), 1);
  const confirmRate = data?.totalBookings ? Math.round((data.confirmedBookings / data.totalBookings) * 100) : 0;
  const cancelRate = data?.totalBookings ? Math.round(((data.cancelledBookings ?? 0) / data.totalBookings) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Analytics</h1>
        <p className="text-sm text-muted mt-0.5">Revenue and performance overview for your venues.</p>
      </div>

      {/* Stat cards */}
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

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-navy">Monthly Revenue</h2>
              <p className="text-xs text-muted mt-0.5">Last 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <ArrowUp size={11} /> Trending
            </div>
          </div>
          {data?.monthlyRevenue?.length ? (
            <div className="flex items-end gap-2 h-40">
              {data.monthlyRevenue.map((m, i) => {
                const heightPct = Math.max((m.revenue / maxMonthly) * 100, 3);
                const isLast = i === data.monthlyRevenue.length - 1;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="relative flex-1 w-full flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ${isLast ? 'bg-primary' : 'bg-primary/30 group-hover:bg-primary/50'}`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-navy text-white text-[9px] rounded px-1.5 py-0.5 whitespace-nowrap">
                        {formatCurrency(m.revenue)}
                      </div>
                    </div>
                    <span className="text-[9px] text-muted font-medium">{m.month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-muted text-sm">No data yet</div>
          )}
        </div>

        {/* Revenue by Venue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-navy mb-6">Revenue by Venue</h2>
          {data?.revenueByVenue?.length ? (
            <div className="space-y-5">
              {data.revenueByVenue.slice(0, 5).map((v, i) => (
                <div key={v.venueName}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-navy truncate max-w-[140px]">{v.venueName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-navy">{formatCurrency(v.revenue)}</span>
                      <span className="text-xs text-muted ml-2">({v.bookings} bookings)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${(v.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Booking health */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-semibold text-navy mb-5">Booking Health</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { label: 'Confirmation Rate', value: confirmRate, color: 'bg-emerald-500', textColor: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Cancellation Rate', value: cancelRate, color: 'bg-red-400', textColor: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Completion Rate', value: Math.max(0, 100 - confirmRate - cancelRate), color: 'bg-blue-400', textColor: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((item) => (
            <div key={item.label} className={`${item.bg} rounded-xl p-4`}>
              <div className="flex items-end justify-between mb-3">
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <p className={`text-2xl font-bold ${item.textColor}`}>{item.value}%</p>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-700`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
