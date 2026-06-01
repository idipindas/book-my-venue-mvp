import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Trash2, ArrowUp, ArrowDown, ImageOff } from 'lucide-react';
import { api } from '@/lib/axios';
import type { VenuePhoto } from '@/types';
import { toast } from '@/store/ui.store';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

const MAX_PHOTOS = 5;

interface Props {
  venueId: string;
}

export function VenuePhotoManager({ venueId }: Props) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: photos = [], isLoading } = useQuery<VenuePhoto[]>({
    queryKey: ['venue-photos', venueId],
    queryFn: async () => {
      const { data } = await api.get(`/owner/venues/${venueId}`);
      return (data.data.photos ?? []) as VenuePhoto[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['venue-photos', venueId] });

  const { mutate: upload, isPending: uploading } = useMutation({
    mutationFn: (files: File[]) => {
      const form = new FormData();
      files.forEach((f) => form.append('photos', f));
      return api.post(`/owner/venues/${venueId}/photos`, form);
    },
    onSuccess: () => { toast.success('Photos uploaded'); invalidate(); },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Upload failed'),
  });

  const { mutate: deletePhoto } = useMutation({
    mutationFn: (photo: VenuePhoto) => {
      setDeletingId(photo.id);
      return api.delete(`/owner/venues/${venueId}/photos`, { data: { url: photo.url } });
    },
    onSuccess: () => { toast.success('Photo removed'); invalidate(); },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Delete failed'),
    onSettled: () => setDeletingId(null),
  });

  const { mutate: reorder, isPending: reordering } = useMutation({
    mutationFn: (ids: string[]) =>
      api.patch(`/owner/venues/${venueId}/photos/reorder`, { ids }),
    onSuccess: () => { toast.success('Order saved'); invalidate(); },
    onError: () => toast.error('Failed to save order'),
  });

  const move = (index: number, direction: -1 | 1) => {
    const next = [...photos];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder(next.map((p) => p.id));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    // Snapshot into a plain array BEFORE clearing the input — some browsers
    // invalidate the FileList when input.value is reset.
    const picked = Array.from(e.target.files);
    e.target.value = '';

    const remaining = MAX_PHOTOS - photos.length;
    if (picked.length > remaining) {
      toast.error(`You can only add ${remaining} more photo${remaining === 1 ? '' : 's'}.`);
      return;
    }
    upload(picked);
  };

  const canUpload = photos.length < MAX_PHOTOS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-navy">Photos</h2>
          <p className="text-xs text-muted mt-0.5">{photos.length}/{MAX_PHOTOS} photos — minimum 1 required</p>
        </div>
        {canUpload && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
          >
            {uploading ? <Spinner size="sm" /> : <ImagePlus size={15} />}
            Add photos
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : photos.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-border rounded-2xl py-12 flex flex-col items-center gap-3 text-muted hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? <Spinner /> : <ImageOff size={32} />}
          <span className="text-sm font-medium">
            {uploading ? 'Uploading…' : 'No photos yet — click to upload'}
          </span>
          <span className="text-xs">JPEG, PNG or WebP · max 5 MB each · up to 5 photos</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100">
              <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />

              {/* overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || reordering}
                  className={cn(
                    'w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-navy transition-all',
                    i === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white',
                  )}
                  title="Move left"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === photos.length - 1 || reordering}
                  className={cn(
                    'w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-navy transition-all',
                    i === photos.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white',
                  )}
                  title="Move right"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => deletePhoto(photo)}
                  disabled={deletingId === photo.id || photos.length === 1}
                  className={cn(
                    'w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-error transition-all',
                    photos.length === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white',
                  )}
                  title={photos.length === 1 ? 'Cannot delete the only photo' : 'Delete photo'}
                >
                  {deletingId === photo.id ? <Spinner size="sm" /> : <Trash2 size={13} />}
                </button>
              </div>

              {/* position badge */}
              <span className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                {i + 1}
              </span>
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  Cover
                </span>
              )}
            </div>
          ))}

          {/* add more slot */}
          {canUpload && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-muted hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
            >
              {uploading ? <Spinner size="sm" /> : <ImagePlus size={20} />}
              <span className="text-xs font-medium">{uploading ? 'Uploading…' : 'Add photo'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
