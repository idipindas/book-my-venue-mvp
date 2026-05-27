import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Building2, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { type Venue, VenueStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { toast } from '@/store/ui.store';

const STATUS_COLORS: Record<VenueStatus, string> = {
  [VenueStatus.APPROVED]: 'bg-emerald-100 text-emerald-700',
  [VenueStatus.PENDING]: 'bg-amber-100 text-amber-700',
  [VenueStatus.REJECTED]: 'bg-red-100 text-red-700',
  [VenueStatus.INACTIVE]: 'bg-slate-100 text-slate-500',
};

function useMyVenues() {
  return useQuery<Venue[]>({
    queryKey: ['owner-venues'],
    queryFn: async () => {
      const { data } = await api.get('/owner/venues');
      return data.data;
    },
  });
}

export default function MyVenues() {
  const qc = useQueryClient();
  const { data: venues, isLoading } = useMyVenues();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { mutate: deleteVenue, isPending: deleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/owner/venues/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner-venues'] });
      toast.success('Venue deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete venue'),
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-semibold text-navy">My Venues</h1>
          <Link to="/owner/venues/new">
            <Button className="gap-2">
              <Plus size={16} /> Add Venue
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : venues?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card py-20 text-center">
            <Building2 size={48} className="text-muted mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-navy mb-2">No venues yet</h3>
            <p className="text-muted text-sm mb-6">List your first venue and start receiving bookings.</p>
            <Link to="/owner/venues/new">
              <Button>Add Your First Venue</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {venues?.map((v, i) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="h-36 relative">
                  {v.photos?.[0] ? (
                    <img src={v.photos[0]} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-teal-gradient flex items-center justify-center">
                      <Building2 size={40} className="text-white/60" />
                    </div>
                  )}
                  <span className={cn('absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full', STATUS_COLORS[v.status])}>
                    {v.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-semibold text-navy mb-1">{v.name}</h3>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <MapPin size={12} /> {v.city}
                  </p>
                  {v.status === VenueStatus.REJECTED && v.rejectedNote && (
                    <p className="mt-2 text-xs text-error bg-red-50 rounded-lg px-3 py-2">
                      Rejection reason: {v.rejectedNote}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <Link to={`/owner/venues/${v.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" fullWidth className="gap-1.5">
                        <Pencil size={13} /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteId(v.id)}
                      className="gap-1.5"
                    >
                      <Trash2 size={13} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Venue" size="sm">
        <p className="text-sm text-slate-600 mb-6">
          This will permanently delete the venue and all associated data. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            variant="danger"
            fullWidth
            loading={deleting}
            onClick={() => deleteVenue(deleteId!)}
          >
            Delete Venue
          </Button>
        </div>
      </Modal>
    </div>
  );
}
