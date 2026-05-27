import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { VenueType, VENUE_TYPE_LABELS } from '@/types';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/store/ui.store';

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
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amenities: [] },
  });

  const selectedAmenities = watch('amenities') ?? [];

  const { mutate: createVenue, isPending } = useMutation({
    mutationFn: (data: FormData) => api.post('/owner/venues', data),
    onSuccess: () => {
      toast.success('Venue submitted for review!');
      navigate('/owner/venues');
    },
    onError: () => toast.error('Failed to create venue'),
  });

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

        <form onSubmit={handleSubmit((data) => createVenue(data))} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
            <h2 className="font-semibold text-navy">Basic Information</h2>
            <Input label="Venue Name" {...register('name')} error={errors.name?.message} />
            <Textarea label="Description" rows={4} {...register('description')} error={errors.description?.message} />
            <Select label="Venue Type" options={typeOptions} {...register('type')} error={errors.type?.message} />
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
