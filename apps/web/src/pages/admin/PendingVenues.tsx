import { useState } from 'react';
import { MapPin, Users, Building2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { type Venue, VENUE_TYPE_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { toast } from '@/store/ui.store';

function VenueCard({
  venue,
  onApprove,
  onReject,
  approving,
}: {
  venue: Venue;
  onApprove: (id: string) => void;
  onReject: (v: Venue) => void;
  approving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Photo */}
        <div className="sm:w-52 h-44 sm:h-auto shrink-0">
          {venue.photos?.[0] ? (
            <img src={venue.photos[0]} alt={venue.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Building2 size={40} className="text-slate-300" />
            </div>
          )}
        </div>

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-bold text-navy text-lg leading-tight">{venue.name}</h3>
              <p className="flex items-center gap-1.5 text-sm text-muted mt-1">
                <MapPin size={13} className="text-primary" />
                {venue.city} · {VENUE_TYPE_LABELS[venue.type] ?? venue.type}
              </p>
            </div>
            <span className="shrink-0 text-xs bg-amber-100 text-amber-700 border border-amber-200 font-semibold px-2.5 py-1 rounded-full">
              Pending Review
            </span>
          </div>

          {/* Key specs */}
          <div className="flex flex-wrap gap-4 text-sm mb-3">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Users size={14} className="text-muted" />
              {venue.capacityMin}–{venue.capacityMax} guests
            </span>
            {venue.pricePerHour && (
              <span className="text-slate-600">{formatCurrency(venue.pricePerHour)}/hr</span>
            )}
            {venue.priceFullDay && (
              <span className="text-slate-600">{formatCurrency(venue.priceFullDay)}/day</span>
            )}
          </div>

          {/* Description toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary font-medium mb-3 hover:underline"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Show less' : 'Read description'}
          </button>

          {expanded && (
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">{venue.description}</p>
          )}

          {/* Amenities */}
          {venue.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {venue.amenities.slice(0, 6).map((a) => (
                <span key={a} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {a}
                </span>
              ))}
              {venue.amenities.length > 6 && (
                <span className="text-xs text-muted">+{venue.amenities.length - 6} more</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => onReject(venue)}
            >
              <X size={14} /> Reject
            </Button>
            <Button
              size="sm"
              loading={approving}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onApprove(venue.id)}
            >
              <Check size={14} /> Approve Venue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PendingVenues() {
  const qc = useQueryClient();
  const { data: venues, isLoading } = useQuery<Venue[]>({
    queryKey: ['admin-pending-venues'],
    queryFn: async () => { const { data } = await api.get('/admin/venues/pending'); return data.data; },
  });

  const [rejectTarget, setRejectTarget] = useState<Venue | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/venues/${id}/approve`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pending-venues'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('Venue approved and published'); },
    onError: () => toast.error('Failed to approve venue'),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => api.patch(`/admin/venues/${id}/reject`, { note }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-pending-venues'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('Venue rejected'); setRejectTarget(null); setRejectNote(''); },
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
              approving={approving}
            />
          ))}
        </div>
      )}

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
