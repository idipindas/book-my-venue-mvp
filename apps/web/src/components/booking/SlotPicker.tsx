import { cn } from '@/lib/utils';
import type { Slot } from '@/types';

interface SlotPickerProps {
  slots: Slot[];
  selectedStart: string | null;
  selectedEnd: string | null;
  onSelect: (start: string, end: string) => void;
}

export function SlotPicker({ slots, selectedStart, selectedEnd, onSelect }: SlotPickerProps) {
  const isInRange = (time: string) => {
    if (!selectedStart || !selectedEnd) return false;
    return time >= selectedStart && time < selectedEnd;
  };

  const handleClick = (time: string, available: boolean) => {
    if (!available) return;
    if (!selectedStart || (selectedStart && selectedEnd)) {
      onSelect(time, '');
    } else {
      if (time <= selectedStart) {
        onSelect(time, '');
      } else {
        const end = String(parseInt(time) + 1).padStart(2, '0') + ':00';
        onSelect(selectedStart, time === selectedStart ? '' : time);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-navy">Select Time Slots</p>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-primary-light border border-primary/30" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-200" /> Booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-primary" /> Selected
          </span>
        </div>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {slots.map((slot) => {
          const isSelected = slot.time === selectedStart || isInRange(slot.time);
          return (
            <button
              key={slot.time}
              disabled={!slot.available}
              onClick={() => handleClick(slot.time, slot.available)}
              className={cn(
                'py-2 px-1 rounded-lg text-xs font-medium transition-all duration-150 text-center',
                slot.available
                  ? isSelected
                    ? 'bg-primary text-white shadow-sm scale-[1.02]'
                    : 'bg-primary-light text-primary hover:bg-primary/20 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
              )}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
      {selectedStart && (
        <p className="mt-3 text-sm text-primary font-medium">
          Selected: {selectedStart}
          {selectedEnd && ` → ${selectedEnd}`}
        </p>
      )}
    </div>
  );
}
