import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Users, Clock, Calendar, ChevronRight, Check,
  ArrowLeft, Star,
} from 'lucide-react';
import { useVenue, useVenueAvailability } from '@/hooks/useVenues';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { VenueStatusBadge } from '@/components/ui/Badge';
import { formatCurrency, getVenuePlaceholderGradient } from '@/lib/utils';
import { VENUE_TYPE_LABELS } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);

  const { data: venue, isLoading } = useVenue(id!);
  const { data: availability } = useVenueAvailability(id!, selectedDate);

  if (isLoading) return <div className="pt-16"><PageSpinner /></div>;
  if (!venue) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <p className="text-muted">Venue not found.</p>
    </div>
  );

  const gradient = getVenuePlaceholderGradient(venue.name);
  const availableSlots = availability?.slots.filter((s) => s.available).length ?? 0;

  const handleBook = () => {
    if (!user) {
      navigate(`/auth/login?next=${encodeURIComponent(`/venues/${id}/book`)}`);
      return;
    }
    navigate(`/venues/${id}/book`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-2 text-sm text-muted">
          <Link to="/venues" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft size={14} /> Venues
          </Link>
          <ChevronRight size={12} />
          <span className="text-navy font-medium truncate">{venue.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="rounded-2xl overflow-hidden bg-white shadow-card">
              <div className="aspect-[16/9] relative">
                {venue.photos.length > 0 ? (
                  <img
                    src={venue.photos[photoIndex]}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', gradient)}>
                    <span className="font-display text-8xl text-white/60 font-semibold">
                      {venue.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <VenueStatusBadge status={venue.status} />
                </div>
              </div>
              {venue.photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-thin">
                  {venue.photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={cn(
                        'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                        photoIndex === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                      )}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Venue info */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="accent">{VENUE_TYPE_LABELS[venue.type]}</Badge>
                  </div>
                  <h1 className="font-display text-3xl font-semibold text-navy">{venue.name}</h1>
                  <div className="flex items-center gap-1.5 text-muted text-sm mt-1">
                    <MapPin size={14} /> {venue.address}, {venue.city}, Kerala
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-accent">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-semibold text-navy">4.8</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">{venue.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                <Stat label="Capacity" value={`${venue.capacityMin}–${venue.capacityMax}`} icon={<Users size={16} />} />
                {venue.pricePerHour && <Stat label="Per Hour" value={formatCurrency(venue.pricePerHour)} icon={<Clock size={16} />} />}
                {venue.priceHalfDay && <Stat label="Half Day" value={formatCurrency(venue.priceHalfDay)} icon={<Calendar size={16} />} />}
                {venue.priceFullDay && <Stat label="Full Day" value={formatCurrency(venue.priceFullDay)} icon={<Calendar size={16} />} />}
              </div>
            </div>

            {/* Amenities */}
            {venue.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-display text-xl font-semibold text-navy mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {venue.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="w-5 h-5 bg-primary-light rounded-full flex items-center justify-center shrink-0">
                        <Check size={11} className="text-primary" />
                      </div>
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: booking panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold text-navy mb-4">Check Availability</h2>

              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium text-navy">Select a date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full h-10 rounded-xl border border-border px-3 text-sm text-navy focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              {selectedDate && availability && (
                <div className="mb-4 p-3 bg-slate-50 rounded-xl text-sm text-slate-600">
                  {availableSlots > 0 ? (
                    <span className="text-success font-medium">✓ {availableSlots} slots available on this date</span>
                  ) : (
                    <span className="text-error font-medium">✗ No slots available on this date</span>
                  )}
                </div>
              )}

              <Button fullWidth size="lg" onClick={handleBook}>
                {user ? 'Book Now' : 'Sign In to Book'}
              </Button>

              <div className="mt-4 space-y-2 text-xs text-muted">
                <p className="flex items-center gap-1.5"><Check size={12} className="text-success" /> Free cancellation 24h before event</p>
                <p className="flex items-center gap-1.5"><Check size={12} className="text-success" /> Instant booking confirmation</p>
                <p className="flex items-center gap-1.5"><Check size={12} className="text-success" /> Secure Razorpay payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-muted mb-1 text-xs">{icon}{label}</div>
      <p className="font-semibold text-navy text-sm">{value}</p>
    </div>
  );
}
