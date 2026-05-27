import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, Users } from 'lucide-react';
import { useVenue, useVenueAvailability } from '@/hooks/useVenues';
import { useCreateBooking } from '@/hooks/useBookings';
import { SlotPicker } from '@/components/booking/SlotPicker';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const guestSchema = z.object({
  guestCount: z.coerce.number().min(1, 'At least 1 guest'),
});

const steps = ['Select Slot', 'Review & Confirm', 'Payment'];

export default function BookingFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const { data: venue, isLoading } = useVenue(id!);
  const { data: availability } = useVenueAvailability(id!, date);
  const { mutate: createBooking, isPending, data: newBooking } = useCreateBooking();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(guestSchema),
    defaultValues: { guestCount: 50 },
  });
  const guestCount = watch('guestCount');

  if (isLoading || !venue) return <div className="pt-16"><PageSpinner /></div>;

  const calcTotal = () => {
    if (!startTime || !endTime || !venue) return 0;
    const hours = parseInt(endTime) - parseInt(startTime);
    if (venue.pricePerHour) return venue.pricePerHour * hours;
    if (hours >= 8 && venue.priceFullDay) return Number(venue.priceFullDay);
    if (hours >= 4 && venue.priceHalfDay) return Number(venue.priceHalfDay);
    return 0;
  };

  const canProceedStep0 = date && startTime && endTime && endTime > startTime;

  const onConfirm = handleSubmit(() => {
    if (!canProceedStep0) return;
    createBooking(
      { venueId: id!, date, startTime: startTime!, endTime: endTime!, guestCount: Number(guestCount) },
      {
        onSuccess: (booking) => {
          setStep(2);
        },
      }
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Progress bar */}
      <div className="bg-white border-b border-border sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                'flex items-center gap-2 text-sm font-medium',
                i < step ? 'text-primary' : i === step ? 'text-navy' : 'text-muted'
              )}>
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  i < step ? 'bg-primary text-white' : i === step ? 'bg-navy text-white' : 'bg-slate-200 text-muted'
                )}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="hidden sm:block">{s}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-muted mx-2 sm:mx-4" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main steps */}
          <div className="lg:col-span-2">
            {/* Step 0: Date + Slot */}
            {step === 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6 space-y-6 animate-fade-up">
                <h2 className="font-display text-2xl font-semibold text-navy">Select Date & Time</h2>

                <div>
                  <label className="text-sm font-medium text-navy mb-2 block">Event Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setStartTime(null); setEndTime(null); }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-10 rounded-xl border border-border px-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>

                {date && availability && (
                  <SlotPicker
                    slots={availability.slots}
                    selectedStart={startTime}
                    selectedEnd={endTime}
                    onSelect={(s, e) => { setStartTime(s); setEndTime(e); }}
                  />
                )}

                {date && !availability && (
                  <p className="text-sm text-muted text-center py-4">No availability data for this date.</p>
                )}

                <Button
                  fullWidth
                  disabled={!canProceedStep0}
                  onClick={() => setStep(1)}
                >
                  Continue to Review
                </Button>
              </div>
            )}

            {/* Step 1: Guest count + Review */}
            {step === 1 && (
              <form onSubmit={onConfirm} className="bg-white rounded-2xl shadow-card p-6 space-y-5 animate-fade-up">
                <h2 className="font-display text-2xl font-semibold text-navy">Confirm Booking</h2>

                <Input
                  label="Number of Guests"
                  type="number"
                  leftIcon={<Users size={16} />}
                  min={venue.capacityMin}
                  max={venue.capacityMax}
                  hint={`Capacity: ${venue.capacityMin}–${venue.capacityMax} guests`}
                  error={errors.guestCount?.message}
                  {...register('guestCount')}
                />

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} type="button">Back</Button>
                  <Button type="submit" fullWidth loading={isPending}>Confirm Booking</Button>
                </div>
              </form>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-card p-6 text-center animate-fade-up space-y-4">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">✓</span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-navy">Booking Created!</h2>
                <p className="text-muted text-sm">
                  Your booking is pending payment. Complete payment to confirm your slot.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Button fullWidth variant="accent">Complete Payment via Razorpay</Button>
                  <Button fullWidth variant="outline" onClick={() => navigate('/dashboard/bookings')}>
                    View My Bookings
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div>
            {date && startTime && endTime && (
              <BookingSummary
                venue={venue}
                date={date}
                startTime={startTime}
                endTime={endTime}
                guestCount={Number(guestCount)}
                totalAmount={calcTotal()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
