import { useSearchParams } from 'react-router-dom';
import { VenueCard } from '@/components/venue/VenueCard';
import { VenueFilter } from '@/components/venue/VenueFilter';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { useVenues, type VenueFilters } from '@/hooks/useVenues';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';

export default function Venues() {
  const [params, setParams] = useSearchParams();

  const filters: VenueFilters = {
    type: params.get('type') ?? undefined,
    city: params.get('city') ?? undefined,
    minCapacity: params.get('minCapacity') ? Number(params.get('minCapacity')) : undefined,
    maxCapacity: params.get('maxCapacity') ? Number(params.get('maxCapacity')) : undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    date: params.get('date') ?? undefined,
    page: params.get('page') ? Number(params.get('page')) : 1,
    limit: 12,
  };

  const { data, isLoading, isFetching } = useVenues(filters);

  const updateFilters = (f: VenueFilters) => {
    const next = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== undefined && v !== '') next.set(k, String(v));
    });
    setParams(next);
  };

  const setPage = (p: number) => {
    const next = new URLSearchParams(params);
    next.set('page', String(p));
    setParams(next);
  };

  const total = data?.meta.total ?? 0;
  const page = filters.page ?? 1;
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      {/* Header */}
      <div className="bg-navy text-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl font-semibold mb-1">Explore Venues</h1>
          <p className="text-white/60 text-sm">
            {isLoading ? 'Loading...' : `${total} venues found across Kerala`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 items-start">
          {/* Filter sidebar (mobile toggle + desktop) */}
          <VenueFilter filters={filters} onChange={updateFilters} />

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter button above results */}
            <div className="lg:hidden mb-4">
              <VenueFilter filters={filters} onChange={updateFilters} />
            </div>

            {isLoading || isFetching ? (
              <PageSpinner />
            ) : data?.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <SearchX size={48} className="text-muted mb-4" />
                <h3 className="font-display text-2xl font-semibold text-navy mb-2">No venues found</h3>
                <p className="text-muted text-sm mb-6">Try adjusting your filters or searching a different city.</p>
                <Button variant="outline" onClick={() => updateFilters({ page: 1, limit: 12 })}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {data?.data.map((venue, i) => (
                    <div key={venue.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                      <VenueCard venue={venue} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm text-slate-600">
                      Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
