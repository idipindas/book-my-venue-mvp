import { Link } from 'react-router-dom';
import { MapPin, Users, Clock } from 'lucide-react';
import { cn, formatCurrency, getVenuePlaceholderGradient } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { Venue } from '@/types';
import { VENUE_TYPE_LABELS } from '@/types';

interface VenueCardProps {
  venue: Venue;
  className?: string;
}

export function VenueCard({ venue, className }: VenueCardProps) {
  const photo = venue.photos?.[0];
  const gradient = getVenuePlaceholderGradient(venue.name);

  return (
    <Link
      to={`/venues/${venue.id}`}
      className={cn(
        'group flex flex-col bg-white rounded-2xl overflow-hidden',
        'shadow-card hover:shadow-card-hover hover:-translate-y-1',
        'transition-all duration-300',
        className
      )}
    >
      {/* Photo */}
      <div className="relative h-48 overflow-hidden shrink-0">
        {photo ? (
          <img
            src={photo}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={cn(
              'w-full h-full bg-gradient-to-br flex items-center justify-center',
              gradient
            )}
          >
            <span className="font-display text-5xl text-white/80 font-semibold">
              {venue.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="accent" size="sm">
            {VENUE_TYPE_LABELS[venue.type]}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-display text-xl font-semibold text-navy leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {venue.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-muted">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{venue.city}, Kerala</span>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 flex-1">{venue.description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Users size={12} /> {venue.capacityMin}–{venue.capacityMax}
            </span>
            {venue.pricePerHour && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {formatCurrency(venue.pricePerHour)}/hr
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-primary">
            from {formatCurrency(venue.pricePerHour ?? venue.priceHalfDay ?? venue.priceFullDay)}
          </span>
        </div>
      </div>
    </Link>
  );
}
