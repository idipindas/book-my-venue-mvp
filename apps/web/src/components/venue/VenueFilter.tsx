import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { VenueType, VENUE_TYPE_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import type { VenueFilters } from '@/hooks/useVenues';

interface VenueFilterProps {
  filters: VenueFilters;
  onChange: (filters: VenueFilters) => void;
}

const venueTypeOptions = [
  { value: '', label: 'All Types' },
  ...Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const keralasCities = [
  { value: '', label: 'All Cities' },
  ...['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kottayam', 'Munnar', 'Alappuzha', 'Palakkad', 'Kannur'].map(
    (c) => ({ value: c, label: c })
  ),
];

export function VenueFilter({ filters, onChange }: VenueFilterProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  const update = (key: keyof VenueFilters, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  const reset = () => onChange({ page: 1, limit: 12 });

  const FilterContent = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-navy flex items-center gap-2">
          <SlidersHorizontal size={16} /> Filters
        </h3>
        {hasActiveFilters && (
          <button onClick={reset} className="text-xs text-primary hover:underline flex items-center gap-1">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <Select
        label="Venue Type"
        options={venueTypeOptions}
        value={filters.type ?? ''}
        onChange={(e) => update('type', e.target.value)}
      />

      <Select
        label="City"
        options={keralasCities}
        value={filters.city ?? ''}
        onChange={(e) => update('city', e.target.value)}
      />

      <div>
        <p className="text-sm font-medium text-navy mb-2">Capacity</p>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={filters.minCapacity ?? ''}
            onChange={(e) => update('minCapacity', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={filters.maxCapacity ?? ''}
            onChange={(e) => update('maxCapacity', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-navy mb-2">Price per Hour (₹)</p>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={filters.minPrice ?? ''}
            onChange={(e) => update('minPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            placeholder="Max"
            type="number"
            value={filters.maxPrice ?? ''}
            onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <Input
        label="Available Date"
        type="date"
        value={filters.date ?? ''}
        onChange={(e) => update('date', e.target.value)}
        min={new Date().toISOString().split('T')[0]}
      />
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden flex items-center gap-2"
        onClick={() => setMobileOpen(true)}
      >
        <SlidersHorizontal size={15} /> Filters
        {hasActiveFilters && (
          <span className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>
        )}
      </Button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-float p-5 overflow-y-auto scrollbar-thin animate-slide-in-right">
            <FilterContent />
            <Button fullWidth className="mt-6" onClick={() => setMobileOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={cn('hidden lg:block w-60 shrink-0')}>
        <div className="sticky top-24 bg-white rounded-2xl shadow-card p-5">
          <FilterContent />
        </div>
      </div>
    </>
  );
}
