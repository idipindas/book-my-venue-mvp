import { useState } from 'react';
import {
  MapPin, Users, Building2, Check, X, Eye,
  Clock, Calendar, Mail, Phone,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { type Venue, VENUE_TYPE_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { toast } from '@/store/ui.store';
import { cn } from '@/lib/utils';

// ─── Detail Modal ────────────────────────────────────────────────────────────

function VenueDetailModal({
  venue,
  open,
  onClose,
  onApprove,
  onReject,
  approving,
}: {
  venue: Venue;
  open: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (v: Venue) => void;
  approving: boolean;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);

  return (
    <Modal open={open} onClose={onClose} title="Venue Details" size="lg">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">

        {/* Photo gallery */}
        <div className="rounded-xl overflow-hidden bg-slate-100">
          {venue.photos?.length > 0 ? (
            <>
              <div className="aspect-video relative">
                <img
                  src={venue.photos[photoIndex].url}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {photoIndex + 1} / {venue.photos.length}
                </span>
              </div>
              {venue.photos.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto">
                  {venue.photos.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => setPhotoIndex(i)}
                      className={cn(
                        'shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all',
                        photoIndex === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-90',
                      )}
                    >
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-video flex items-center justify-center text-muted">
              <Building2 size={48} className="opacity-30" />
            </div>
          )}
        </div>

        {/* Name + type + status */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-primary/10 text-primary font-medium px-2.5 py-0.5 rounded-full">
              {VENUE_TYPE_LABELS[venue.type] ?? venue.type}
            </span>
            <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2.5 py-0.5 rounded-full">
              Pending Review
            </span>
          </div>
          <h2 className="text-xl font-bold text-navy">{venue.name}</h2>
          <p className="flex items-center gap-1 text-sm text-muted mt-1">
            <MapPin size={13} /> {venue.address}, {venue.city}, {venue.state}
          </p>
          {(venue.latitude || venue.longitude) && (
            <p className="text-xs text-muted mt-0.5 pl-4">
              {venue.latitude}, {venue.longitude}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-navy mb-1.5">Description</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{venue.description}</p>
        </div>

        {/* Owner info */}
        {venue.owner && (
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-navy mb-2">Submitted by</h3>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold text-sm">
                  {venue.owner.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-navy">{venue.owner.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Mail size={11} /> {venue.owner.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Capacity & Pricing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Capacity</h3>
            <p className="flex items-center gap-1.5 text-sm text-navy font-medium">
              <Users size={14} className="text-primary" />
              {venue.capacityMin} – {venue.capacityMax} guests
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Pricing</h3>
            <div className="space-y-1">
              {venue.pricePerHour && (
                <p className="flex items-center gap-1.5 text-sm text-navy">
                  <Clock size={13} className="text-muted" /> {formatCurrency(venue.pricePerHour)}/hr
                </p>
              )}
              {venue.priceHalfDay && (
                <p className="flex items-center gap-1.5 text-sm text-navy">
                  <Calendar size={13} className="text-muted" /> {formatCurrency(venue.priceHalfDay)} half day
                </p>
              )}
              {venue.priceFullDay && (
                <p className="flex items-center gap-1.5 text-sm text-navy">
                  <Calendar size={13} className="text-muted" /> {formatCurrency(venue.priceFullDay)} full day
                </p>
              )}
              {!venue.pricePerHour && !venue.priceHalfDay && !venue.priceFullDay && (
                <p className="text-sm text-muted">Not specified</p>
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        {venue.amenities?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-navy mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-1.5">
              {venue.amenities.map((a) => (
                <span key={a} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Submitted date */}
        <p className="text-xs text-muted">
          Submitted {new Date(venue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-border">
        <Button
          variant="outline"
          fullWidth
          className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
          onClick={() => { onClose(); onReject(venue); }}
        >
          <X size={14} /> Reject
        </Button>
        <Button
          fullWidth
          loading={approving}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onApprove(venue.id)}
        >
          <Check size={14} /> Approve Venue
        </Button>
      </div>
    </Modal>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function VenueCard({
  venue,
  onApprove,
  onReject,
  onView,
  approving,
}: {
  venue: Venue;
  onApprove: (id: string) => void;
  onReject: (v: Venue) => void;
  onView: (v: Venue) => void;
  approving: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Cover photo */}
        <div className="sm:w-48 h-40 sm:h-auto shrink-0 relative">
          {venue.photos?.[0] ? (
            <img src={venue.photos[0].url} alt={venue.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Building2 size={36} className="text-slate-300" />
            </div>
          )}
          {venue.photos?.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              +{venue.photos.length - 1} more
            </span>
          )}
        </div>

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-bold text-navy text-lg leading-tight">{venue.name}</h3>
              <p className="flex items-center gap-1.5 text-sm text-muted mt-0.5">
                <MapPin size={13} className="text-primary" />
                {venue.city} · {VENUE_TYPE_LABELS[venue.type] ?? venue.type}
              </p>
            </div>
            <span className="shrink-0 text-xs bg-amber-100 text-amber-700 border border-amber-200 font-semibold px-2.5 py-1 rounded-full">
              Pending
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
            <span className="flex items-center gap-1.5">
              <Users size={13} className="text-muted" /> {venue.capacityMin}–{venue.capacityMax} guests
            </span>
            {venue.pricePerHour && <span>{formatCurrency(venue.pricePerHour)}/hr</span>}
            {venue.priceFullDay && <span>{formatCurrency(venue.priceFullDay)}/day</span>}
          </div>

          {venue.owner && (
            <p className="text-xs text-muted mb-3 flex items-center gap-1">
              <Mail size={11} /> {venue.owner.name} · {venue.owner.email}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onView(venue)}
            >
              <Eye size={13} /> View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => onReject(venue)}
            >
              <X size={13} /> Reject
            </Button>
            <Button
              size="sm"
              loading={approving}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onApprove(venue.id)}
            >
              <Check size={13} /> Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PendingVenues() {
  const qc = useQueryClient();
  const { data: venues, isLoading } = useQuery<Venue[]>({
    queryKey: ['admin-pending-venues'],
    queryFn: async () => {
      const { data } = await api.get('/admin/venues/pending');
      return data.data;
    },
  });

  const [viewTarget, setViewTarget] = useState<Venue | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Venue | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-pending-venues'] });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
  };

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/venues/${id}/approve`),
    onSuccess: () => { invalidate(); setViewTarget(null); toast.success('Venue approved and published'); },
    onError: () => toast.error('Failed to approve venue'),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      api.patch(`/admin/venues/${id}/reject`, { note }),
    onSuccess: () => {
      invalidate();
      setRejectTarget(null);
      setRejectNote('');
      toast.success('Venue rejected');
    },
    onError: () => toast.error('Failed to reject venue'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Pending Venues</h1>
          <p className="text-sm text-muted mt-0.5">
            {venues?.length ?? 0} venue{(venues?.length ?? 0) !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
        {(venues?.length ?? 0) > 0 && (
          <span className="bg-amber-100 text-amber-700 border border-amber-200 text-sm font-semibold px-3 py-1.5 rounded-xl">
            {venues?.length} to review
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-14 flex justify-center"><PageSpinner /></div>
      ) : venues?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-20 flex flex-col items-center text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-5">
            <Check size={36} className="text-emerald-500" />
          </div>
          <p className="font-bold text-navy text-lg mb-2">All caught up!</p>
          <p className="text-sm text-muted max-w-xs">No venues are pending review. New submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {venues?.map((v) => (
            <VenueCard
              key={v.id}
              venue={v}
              onApprove={(id) => approve(id)}
              onReject={(venue) => setRejectTarget(venue)}
              onView={(venue) => setViewTarget(venue)}
              approving={approving}
            />
          ))}
        </div>
      )}

      {/* Full detail modal */}
      {viewTarget && (
        <VenueDetailModal
          venue={viewTarget}
          open={!!viewTarget}
          onClose={() => setViewTarget(null)}
          onApprove={(id) => approve(id)}
          onReject={(v) => { setViewTarget(null); setRejectTarget(v); }}
          approving={approving}
        />
      )}

      {/* Reject modal */}
      <Modal
        open={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectNote(''); }}
        title="Reject Venue Submission"
        size="sm"
      >
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 mb-5">
          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <Building2 size={16} className="text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">{rejectTarget?.name}</p>
            <p className="text-xs text-muted">{rejectTarget?.city}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Provide a clear reason. This will be shown to the venue owner so they can make improvements.
        </p>
        <Input
          label="Rejection Reason *"
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="e.g. Incomplete description, missing pricing..."
          className="mb-6"
        />
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => { setRejectTarget(null); setRejectNote(''); }}>
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={rejecting}
            disabled={!rejectNote.trim()}
            onClick={() => reject({ id: rejectTarget!.id, note: rejectNote })}
          >
            Reject Venue
          </Button>
        </div>
      </Modal>
    </div>
  );
}
