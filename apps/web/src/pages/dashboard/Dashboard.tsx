import { Link } from 'react-router-dom';
import {
  CalendarDays, CheckCircle2, Clock, ArrowRight, MapPin,
  TrendingUp, Wallet, Star, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useBookings } from '@/hooks/useBookings';
import { BookingStatus } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';

function StatCard({
  label, value, icon, color, trend,
}: {
  label: string; value: string | number; icon: React.ReactNode;
  color: string; trend?: string;
}) {
  return (
    <div className={`rounded-2xl p-5 flex flex-col gap-3 ${color}`}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">{trend}</span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold leading-none mb-1">{value}</p>
        <p className="text-sm opacity-75">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: bookings, isLoading } = useBookings();

  const upcoming = bookings?.filter(
    (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING
  ) ?? [];
  const confirmed = bookings?.filter((b) => b.status === BookingStatus.CONFIRMED).length ?? 0;
  const pending = bookings?.filter((b) => b.status === BookingStatus.PENDING).length ?? 0;
  const total = bookings?.length ?? 0;
  const totalSpent = bookings?.reduce((sum, b) => sum + Number(b.totalAmount), 0) ?? 0;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome banner */}
      <div className="bg-teal-gradient rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full bg-white translate-y-16" />
        </div>
        <div className="relative">
          <p className="text-white/70 text-sm mb-1">{greeting},</p>
          <h1 className="font-display text-3xl font-semibold mb-3">{user?.name.split(' ')[0]}!</h1>
          <p className="text-white/70 text-sm mb-5">Ready to book your next venue?</p>
          <Link to="/venues">
            <Button variant="accent" size="sm" className="gap-2 shadow-lg">
              <MapPin size={14} /> Explore Venues
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Bookings"
          value={total}
          icon={<CalendarDays size={20} className="text-white" />}
          color="bg-navy text-white"
        />
        <StatCard
          label="Confirmed"
          value={confirmed}
          icon={<CheckCircle2 size={20} className="text-white" />}
          color="bg-emerald-600 text-white"
        />
        <StatCard
          label="Pending"
          value={pending}
          icon={<Clock size={20} className="text-white" />}
          color="bg-amber-500 text-white"
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(totalSpent)}
          icon={<Wallet size={20} className="text-white" />}
          color="bg-violet-600 text-white"
        />
      </div>

      {/* Upcoming bookings */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp size={14} className="text-primary" />
            </div>
            <h2 className="font-semibold text-navy">Upcoming Bookings</h2>
            {upcoming.length > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {upcoming.length}
              </span>
            )}
          </div>
          <Link to="/dashboard/bookings">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              See all <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-14 flex items-center justify-center"><PageSpinner /></div>
        ) : upcoming.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-5">
              <CalendarDays size={32} className="text-slate-300" />
            </div>
            <p className="font-semibold text-navy mb-2">No upcoming bookings</p>
            <p className="text-sm text-muted mb-6 max-w-xs">
              Discover beautiful venues across Kerala for your next event.
            </p>
            <Link to="/venues">
              <Button size="sm" className="gap-2">
                <MapPin size={14} /> Find a Venue
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcoming.slice(0, 5).map((b) => (
              <Link
                key={b.id}
                to={`/dashboard/bookings/${b.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                {/* Date block */}
                <div className="shrink-0 w-12 text-center bg-primary/8 rounded-xl py-2 px-1">
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wide">
                    {new Date(b.date).toLocaleString('en', { month: 'short' })}
                  </p>
                  <p className="text-xl font-bold text-navy leading-tight">
                    {new Date(b.date).getDate()}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy text-sm truncate mb-0.5">{b.venue?.name ?? 'Venue'}</p>
                  <p className="text-xs text-muted">{b.startTime}–{b.endTime} · {b.guestCount} guests</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-navy">{formatCurrency(b.totalAmount)}</p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                  <ChevronRight size={15} className="text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Promo card if no bookings */}
      {total === 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: <MapPin size={22} />, title: 'Find Venues', desc: '50+ venues across Kerala', color: 'text-primary', bg: 'bg-primary/10' },
            { icon: <CalendarDays size={22} />, title: 'Easy Booking', desc: 'Book in under 2 minutes', color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: <Star size={22} />, title: 'Trusted Platform', desc: 'Verified, quality venues', color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}>
                <span className={f.color}>{f.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-navy text-sm">{f.title}</p>
                <p className="text-xs text-muted mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
