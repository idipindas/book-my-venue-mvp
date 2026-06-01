import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ImagePlus, X } from 'lucide-react';
import { api } from '@/lib/axios';
import { VenueType, VENUE_TYPE_LABELS } from '@/types';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/store/ui.store';

const MAX_PHOTOS = 5;

const AMENITIES = [
  'WiFi', 'Parking', 'AC', 'Projector', 'Sound System', 'Catering',
  'Stage', 'Restrooms', 'Security', 'Generator', 'CCTV', 'Wheelchair Access',
];

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.nativeEnum(VenueType),
  address: z.string().min(5),
  city: z.string().min(2),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  capacityMin: z.coerce.number().min(1),
  capacityMax: z.coerce.number().min(1),
  pricePerHour: z.coerce.number().optional(),
  priceHalfDay: z.coerce.number().optional(),
  priceFullDay: z.coerce.number().optional(),
  amenities: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof schema>;

export default function AddVenue() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amenities: [] },
  });

  const selectedAmenities = watch('amenities') ?? [];

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    const combined = [...photos, ...picked].slice(0, MAX_PHOTOS);
    setPhotos(combined);
    setPhotoError('');
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const { mutate: createVenue, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      if (photos.length === 0) throw new Error('At least 1 photo is required.');

      const form = new FormData();
      form.append('name', data.name);
      form.append('description', data.description);
      form.append('type', data.type);
      form.append('address', data.address);
      form.append('city', data.city);
      form.append('latitude', String(data.latitude));
      form.append('longitude', String(data.longitude));
      form.append('capacityMin', String(data.capacityMin));
      form.append('capacityMax', String(data.capacityMax));
      if (data.pricePerHour) form.append('pricePerHour', String(data.pricePerHour));
      if (data.priceHalfDay) form.append('priceHalfDay', String(data.priceHalfDay));
      if (data.priceFullDay) form.append('priceFullDay', String(data.priceFullDay));
      form.append('amenities', JSON.stringify(data.amenities ?? []));
      photos.forEach((f) => form.append('photos', f));

      return api.post('/owner/venues', form);
    },
    onSuccess: () => {
      toast.success('Venue submitted for review!');
      navigate('/owner/venues');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message ?? err?.message ?? 'Failed to create venue';
      toast.error(msg);
    },
  });

  const onSubmit = (data: FormData) => {
    if (photos.length === 0) {
      setPhotoError('At least 1 photo is required.');
      return;
    }
    createVenue(data);
  };

  const toggleAmenity = (a: string) => {
    const current = selectedAmenities;
    setValue('amenities', current.includes(a) ? current.filter((x) => x !== a) : [...current, a]);
  };

  const typeOptions = Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-navy mb-2">Add New Venue</h1>
        <p className="text-muted text-sm mb-8">Your venue will be reviewed by our team before going live.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h2 className="font-semibold text-navy">Basic Information</h2>
            <Input label="Venue Name" {...register('name')} error={errors.name?.message} />
            <Textarea label="Description" rows={4} {...register('description')} error={errors.description?.message} />
            <Select label="Venue Type" options={typeOptions} {...register('type')} error={errors.type?.message} />
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-navy">Photos</h2>
                <p className="text-xs text-muted mt-0.5">{photos.length}/{MAX_PHOTOS} — minimum 1 required</p>
              </div>
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  <ImagePlus size={15} /> Add photos
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={onFilePick}
            />

            {photos.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl py-10 flex flex-col items-center gap-2 transition-colors ${
                  photoError
                    ? 'border-error text-error bg-red-50'
                    : 'border-border text-muted hover:border-primary/40 hover:text-primary'
                }`}
              >
                <ImagePlus size={28} />
                <span className="text-sm font-medium">Click to add photos</span>
                <span className="text-xs">JPEG, PNG or WebP · max 5 MB each · up to 5 photos</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((file, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <ImagePlus size={18} />
                    <span className="text-[11px] font-medium">Add more</span>
                  </button>
                )}
              </div>
            )}

            {photoError && <p className="text-xs text-error">{photoError}</p>}
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h2 className="font-semibold text-navy">Location</h2>
            <Input label="Address" {...register('address')} error={errors.address?.message} />
            <Input label="City" {...register('city')} error={errors.city?.message} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Latitude" type="number" step="any" {...register('latitude')} error={errors.latitude?.message} />
              <Input label="Longitude" type="number" step="any" {...register('longitude')} error={errors.longitude?.message} />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h2 className="font-semibold text-navy">Capacity & Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Capacity" type="number" {...register('capacityMin')} error={errors.capacityMin?.message} />
              <Input label="Max Capacity" type="number" {...register('capacityMax')} error={errors.capacityMax?.message} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Price / Hour (₹)" type="number" {...register('pricePerHour')} />
              <Input label="Half Day (₹)" type="number" {...register('priceHalfDay')} />
              <Input label="Full Day (₹)" type="number" {...register('priceFullDay')} />
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-semibold text-navy mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selectedAmenities.includes(a)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-600 border-border hover:border-primary/50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth loading={isPending} size="lg">
            Submit Venue for Review
          </Button>
        </form>
      </div>
    </div>
  );
}
