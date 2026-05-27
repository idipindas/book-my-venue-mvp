import { Calendar, Clock, Users, MapPin, IndianRupee, Info } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Venue } from '@/types';

interface BookingSummaryProps {
  venue: Venue;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  totalAmount: number;
}

export function BookingSummary({
  venue,
  date,
  startTime,
  endTime,
  guestCount,
  totalAmount,
}: BookingSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="bg-teal-gradient p-5 text-white">
        <p className="text-sm font-medium opacity-80 mb-1">Booking Summary</p>
        <h3 className="font-display text-2xl font-semibold">{venue.name}</h3>
        <div className="flex items-center gap-1 text-sm opacity-80 mt-1">
          <MapPin size={13} /> {venue.city}, Kerala
        </div>
      </div>

      <div className="p-5 space-y-3">
        <SummaryRow icon={<Calendar size={15} />} label="Date" value={formatDate(date)} />
        <SummaryRow icon={<Clock size={15} />} label="Time" value={`${startTime} – ${endTime}`} />
        <SummaryRow icon={<Users size={15} />} label="Guests" value={`${guestCount} people`} />
        <div className="border-t border-border pt-3">
          <SummaryRow
            icon={<IndianRupee size={15} />}
            label="Total Amount"
            value={formatCurrency(totalAmount)}
            bold
          />
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Refund policy:</strong> 100% if cancelled 24h+ before event · 50% if 12–24h · No refund within 12h.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  bold,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted">
        {icon} {label}
      </span>
      <span className={bold ? 'font-bold text-primary text-base' : 'font-medium text-navy'}>
        {value}
      </span>
    </div>
  );
}
