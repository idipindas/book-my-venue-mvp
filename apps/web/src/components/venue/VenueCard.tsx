import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Star, Users } from 'lucide-react';
import { cn, formatCurrency, getVenuePlaceholderGradient } from '@/lib/utils';
import type { Venue } from '@/types';
import { VENUE_TYPE_LABELS } from '@/types';

interface VenueCardProps {
  venue: Venue;
  className?: string;
}

export function VenueCard({ venue, className }: VenueCardProps) {
  const [saved, setSaved] = useState(false);
  const photo = venue.photos?.[0]?.url;
  const gradient = getVenuePlaceholderGradient(venue.name);
  const price = venue.pricePerHour ?? venue.priceHalfDay ?? venue.priceFullDay;
  const priceLabel = venue.pricePerHour ? '/hr' : venue.priceHalfDay ? '/half day' : '/day';

  return (
    <Link
      to={`/venues/${venue.id}`}
      className={cn(
        'group flex flex-col bg-white rounded-2xl overflow-hidden',
        'shadow-card hover:shadow-card-hover hover:-translate-y-1',
        'transition-all duration-300 border border-slate-100/80',
        className
      )}
    >
      {/* Photo — 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] overflow-hidden shrink-0">
        {photo ? (
          <img
            src={photo}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', gradient)}>
            <span className="font-display text-5xl text-white/80 font-semibold">
              {venue.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Top-left: type badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm border border-white/50">
            {VENUE_TYPE_LABELS[venue.type]}
          </span>
        </div>

        {/* Top-right: save heart */}
        <button
          onClick={(e) => { e.preventDefault(); setSaved((s) => !s); }}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm',
            saved
              ? 'bg-accent text-white scale-110'
              : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-accent hover:scale-110'
          )}
        >
          <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
        </button>

        {/* Bottom-left: star rating */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm text-white">
            <Star size={10} fill="currentColor" className="text-amber-400" />
            4.8
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        <h3 className="font-semibold text-navy text-base leading-snug group-hover:text-primary transition-colors line-clamp-1">
          {venue.name}
        </h3>

        <div className="flex items-center gap-1 text-xs text-muted">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{venue.city}, Kerala</span>
        </div>

        <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Users size={11} />
            <span>{venue.capacityMin}–{venue.capacityMax} guests</span>
          </div>
          {price && (
            <div className="text-right">
              <span className="font-bold text-navy text-sm">{formatCurrency(price)}</span>
              <span className="text-xs text-muted ml-0.5">{priceLabel}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
