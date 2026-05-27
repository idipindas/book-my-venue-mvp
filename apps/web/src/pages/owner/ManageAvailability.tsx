import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { type Venue, type Slot } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { toast } from '@/store/ui.store';
import { CalendarDays, Clock, Check, X, ChevronLeft, ChevronRight, Info } from 'lucide-react';

/** All possible hourly slots from 08:00 to 21:00 */
const ALL_SLOTS: string[] = Array.from({ length: 14 }, (_, i) =>
  `${String(i + 8).padStart(2, '0')}:00`
);

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/** Build a 7-day week starting from `start` */
function weekDays(start: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function useMyVenues() {
  return useQuery<Venue[]>({
    queryKey: ['owner-venues'],
    queryFn: async () => {
      const { data } = await api.get('/owner/venues');
      return data.data;
    },
  });
}

function useAvailability(venueId: string, date: string) {
  return useQuery<{ slots: Slot[] }>({
    queryKey: ['venue-availability', venueId, date],
    queryFn: async () => {
      const { data } = await api.get(`/venues/${venueId}/availability`, { params: { date } });
      return data.data;
    },
    enabled: !!venueId && !!date,
  });
}

export default function ManageAvailability() {
  const { data: venues, isLoading: venuesLoading } = useMyVenues();

  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedDate, setSelectedDate] = useState(toYMD(new Date()));

  // Local toggle state: date → set of available slot times
  const [localSlots, setLocalSlots] = useState<Record<string, Set<string>>>({});

  const { data: availability, isLoading: availLoading } = useAvailability(selectedVenueId, selectedDate);

  // When availability loads for a date, seed local state
  useEffect(() => {
    if (!availability) return;
    const available = new Set(
      availability.slots.filter((s) => s.available).map((s) => s.time)
    );
    setLocalSlots((prev) => ({ ...prev, [selectedDate]: available }));
  }, [availability, selectedDate]);

  // Auto-select first venue
  useEffect(() => {
    if (venues?.length && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  const { mutate: saveAvailability, isPending: saving } = useMutation({
    mutationFn: ({ venueId, date, slots }: { venueId: string; date: string; slots: Slot[] }) =>
      api.put(`/owner/venues/${venueId}/availability`, { date, slots }),
    onSuccess: () => toast.success('Availability saved'),
    onError: () => toast.error('Failed to save availability'),
  });

  const days = weekDays(weekStart);

  function toggleSlot(time: string) {
    setLocalSlots((prev) => {
      const current = new Set(prev[selectedDate] ?? []);
      if (current.has(time)) current.delete(time);
      else current.add(time);
      return { ...prev, [selectedDate]: current };
    });
  }

  function setAll(available: boolean) {
    setLocalSlots((prev) => ({
      ...prev,
      [selectedDate]: available ? new Set(ALL_SLOTS) : new Set(),
    }));
  }

  function handleSave() {
    const available = localSlots[selectedDate] ?? new Set();
    const slots: Slot[] = ALL_SLOTS.map((time) => ({
      time,
      available: available.has(time),
    }));
    saveAvailability({ venueId: selectedVenueId, date: selectedDate, slots });
  }

  const currentAvailable = localSlots[selectedDate] ?? new Set(
    availability?.slots.filter((s) => s.available).map((s) => s.time) ?? []
  );

  const availableCount = currentAvailable.size;
  const today = toYMD(new Date());
  const isPast = (date: string) => date < today;

  if (venuesLoading) return <div className="py-14 flex justify-center"><PageSpinner /></div>;

  if (!venues?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
          <CalendarDays size={32} className="text-slate-400" />
        </div>
        <p className="font-bold text-navy text-lg mb-2">No venues yet</p>
        <p className="text-sm text-muted">Add a venue first before managing availability.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Manage Availability</h1>
        <p className="text-sm text-muted mt-0.5">
          Set which time slots are open for bookings on each date.
        </p>
      </div>

      {/* Venue selector */}
      {venues.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {venues.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVenueId(v.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                selectedVenueId === v.id
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-navy hover:text-navy'
              )}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}

      {selectedVenueId && (
        <>
          {/* Week calendar strip */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h2 className="font-semibold text-navy text-sm flex items-center gap-2">
                <CalendarDays size={15} className="text-primary" />
                Select a Date
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setWeekStart((d) => addDays(d, -7))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-muted px-2 font-medium">
                  {days[0].toLocaleString('en', { month: 'short', day: 'numeric' })} –{' '}
                  {days[6].toLocaleString('en', { month: 'short', day: 'numeric' })}
                </span>
                <button
                  onClick={() => setWeekStart((d) => addDays(d, 7))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-100">
              {days.map((day) => {
                const ymd = toYMD(day);
                const isSelected = ymd === selectedDate;
                const isToday = ymd === today;
                const past = isPast(ymd);

                return (
                  <button
                    key={ymd}
                    onClick={() => !past && setSelectedDate(ymd)}
                    disabled={past}
                    className={cn(
                      'bg-white flex flex-col items-center py-3 transition-all',
                      isSelected ? 'bg-navy' : past ? 'opacity-40 cursor-not-allowed' : 'hover:bg-primary/5'
                    )}
                  >
                    <span className={cn('text-[10px] font-semibold uppercase tracking-wide mb-1',
                      isSelected ? 'text-white/60' : 'text-muted'
                    )}>
                      {day.toLocaleString('en', { weekday: 'short' })}
                    </span>
                    <span className={cn(
                      'text-lg font-bold leading-none',
                      isSelected ? 'text-white' : isToday ? 'text-primary' : 'text-navy'
                    )}>
                      {day.getDate()}
                    </span>
                    {isToday && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-primary mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot editor */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-primary" />
                <h2 className="font-semibold text-navy text-sm">
                  Time Slots —{' '}
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en', {
                    weekday: 'long', month: 'long', day: 'numeric',
                  })}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAll(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <Check size={11} /> All open
                </button>
                <button
                  onClick={() => setAll(false)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X size={11} /> All closed
                </button>
              </div>
            </div>

            {availLoading ? (
              <div className="py-10 flex justify-center"><PageSpinner /></div>
            ) : (
              <div className="p-5">
                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                    Open for booking
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" />
                    Closed / unavailable
                  </span>
                </div>

                {/* Slots grid */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {ALL_SLOTS.map((time) => {
                    const open = currentAvailable.has(time);
                    return (
                      <button
                        key={time}
                        onClick={() => toggleSlot(time)}
                        className={cn(
                          'py-2.5 px-1 rounded-xl text-xs font-semibold text-center transition-all border',
                          open
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                        )}
                      >
                        {time}
                        <span className={cn('block text-[9px] mt-0.5 font-normal', open ? 'text-emerald-500' : 'text-slate-300')}>
                          {open ? 'Open' : 'Closed'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Summary + save */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Info size={14} />
                    <span>
                      <strong className="text-navy">{availableCount}</strong> of{' '}
                      <strong className="text-navy">{ALL_SLOTS.length}</strong> slots open
                    </span>
                  </div>
                  <Button onClick={handleSave} loading={saving} className="gap-2" size="sm">
                    <Check size={14} /> Save for this date
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tip */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <Info size={14} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Slots you mark as <strong>Open</strong> will be visible to customers booking your venue.
              Slots marked <strong>Closed</strong> won't be shown. Changes apply immediately after saving.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
