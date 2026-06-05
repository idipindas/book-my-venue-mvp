import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, MapPin, Calendar, ArrowRight, Star, Shield, Zap,
  CheckCircle, Users, Building2, ChevronRight, Utensils,
  Music2, Briefcase, Trees, ShoppingBag, Mic2, Hotel, PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { VenueCard } from '@/components/venue/VenueCard';
import { useVenues } from '@/hooks/useVenues';
import { VENUE_TYPE_LABELS, VenueType } from '@/types';
import { PageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const categoryBadges = [
  { type: VenueType.BIRTHDAY_HALL, label: 'Event Halls', icon: PartyPopper, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { type: VenueType.RESORT,        label: 'Resorts',     icon: Trees,       color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { type: VenueType.CAFE,          label: 'Cafés',       icon: Utensils,    color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { type: VenueType.MEETUP,        label: 'Meeting',     icon: Briefcase,   color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { type: VenueType.HOTEL,         label: 'Hotels',      icon: Hotel,       color: 'bg-violet-50 text-violet-600 border-violet-100' },
  { type: VenueType.AUDITORIUM,    label: 'Auditoriums', icon: Mic2,        color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { type: VenueType.MALL,          label: 'Malls',       icon: ShoppingBag, color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { type: VenueType.VENUE_HALL,    label: 'Venues',      icon: Music2,      color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
];

const categories = [
  { type: VenueType.RESORT,        label: 'Resorts & Hotels',    img: '/resorts/paolo-nicolello-2gOxKj594nM-unsplash.jpg',           gradient: 'from-emerald-900/75 to-emerald-700/30', count: '48 venues' },
  { type: VenueType.BIRTHDAY_HALL, label: 'Event Halls',         img: '/halls/jeremy-wong-weddings-K8KiCHh4WU4-unsplash.jpg',        gradient: 'from-rose-900/75 to-rose-700/30',       count: '62 venues' },
  { type: VenueType.CAFE,          label: 'Cafés & Restaurants', img: '/cafe/petr-sevcovic-qE1jxYXiwOA-unsplash.jpg',                gradient: 'from-amber-900/75 to-amber-700/30',     count: '35 venues' },
  { type: VenueType.MEETUP,        label: 'Meeting Spaces',      img: '/meeting-space/benjamin-child-GWe0dlVD9e0-unsplash.jpg',      gradient: 'from-blue-900/75 to-blue-700/30',       count: '27 venues' },
  { type: VenueType.AUDITORIUM,    label: 'Auditoriums',         img: '/halls/engin-akyurt-i3rFV6ULk-o-unsplash.jpg',               gradient: 'from-indigo-900/75 to-indigo-700/30',   count: '19 venues' },
  { type: VenueType.MALL,          label: 'Malls & Spaces',      img: '/mall/julia-taubitz-oQrC1ToY4xY-unsplash.jpg',               gradient: 'from-slate-900/75 to-slate-700/30',     count: '14 venues' },
];

const stats = [
  { value: '500+', label: 'Verified Venues' },
  { value: '10K+', label: 'Events Hosted' },
  { value: '14',   label: 'Kerala Cities' },
  { value: '4.9★', label: 'Avg. Rating' },
];

const venueTypeOptions = [
  { value: '', label: 'Any type' },
  ...Object.entries(VENUE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

export default function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [floatingVisible, setFloatingVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { data: featuredResult, isLoading } = useVenues({ limit: 6, page: 1 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setFloatingVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    if (date) params.set('date', date);
    navigate(`/venues?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── STICKY FLOATING SEARCH BAR ──────────────────────────────────── */}
      <div className={cn(
        'fixed top-16 left-0 right-0 z-20 transition-all duration-300 pointer-events-none',
        floatingVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2'
      )}>
        <div className="max-w-3xl mx-auto px-4 pt-2">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-glass p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1 bg-slate-50 rounded-xl px-3 py-2">
              <MapPin size={14} className="text-primary shrink-0" />
              <select value={city} onChange={(e) => setCity(e.target.value)} className="flex-1 bg-transparent text-slate-700 text-sm focus:outline-none">
                <option value="">Any city</option>
                {['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kottayam', 'Munnar', 'Alappuzha'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 sm:w-36">
              <Building2 size={14} className="text-primary shrink-0" />
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-transparent text-slate-700 text-sm focus:outline-none">
                {venueTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 sm:w-36">
              <Calendar size={14} className="text-primary shrink-0" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-transparent text-slate-700 text-sm focus:outline-none" />
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/resorts/anmol-seth-hDbCjHNdF48-unsplash.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/88 via-navy/70 to-blue-900/65" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#F8FAFC] to-transparent" />
        {/* Decorative orbs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-36 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/85 text-sm mb-8 animate-fade-in">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            Kerala's #1 Venue Booking Platform
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.08] mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            Find the Perfect
            <span className="block italic text-accent">Venue in Kerala</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            From intimate cafés to grand auditoriums — discover, compare, and instantly
            book unique spaces for any occasion.
          </p>

          {/* Hero search bar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 max-w-3xl mx-auto shadow-2xl animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 flex-1 bg-white/12 hover:bg-white/18 transition-colors rounded-xl px-3 py-2.5">
                <MapPin size={15} className="text-white/50 shrink-0" />
                <select value={city} onChange={(e) => setCity(e.target.value)} className="flex-1 bg-transparent text-white text-sm focus:outline-none">
                  <option value="" className="text-navy bg-white">Any city</option>
                  {['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kottayam', 'Munnar', 'Alappuzha'].map(c => (
                    <option key={c} value={c} className="text-navy bg-white">{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white/12 hover:bg-white/18 transition-colors rounded-xl px-3 py-2.5 sm:w-40">
                <Building2 size={15} className="text-white/50 shrink-0" />
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-transparent text-white text-sm focus:outline-none">
                  {venueTypeOptions.map(o => <option key={o.value} value={o.value} className="text-navy bg-white">{o.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white/12 hover:bg-white/18 transition-colors rounded-xl px-3 py-2.5 sm:w-40">
                <Calendar size={15} className="text-white/50 shrink-0" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]" />
              </div>
              <button onClick={handleSearch} className="bg-accent hover:bg-accent-dark text-white rounded-xl px-5 font-semibold text-sm flex items-center justify-center gap-2 transition-colors py-2.5 sm:py-0 shrink-0">
                <Search size={15} /> Search
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 mt-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/45">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HORIZONTAL SCROLLING CATEGORY BADGES ────────────────────────── */}
      <section className="py-8 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-3 px-4 sm:px-6 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => navigate('/venues')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-primary text-white text-sm font-semibold whitespace-nowrap shrink-0 hover:bg-primary-dark transition-colors shadow-sm"
            >
              All Venues
            </button>
            {categoryBadges.map(({ type: t, label, icon: Icon, color }) => (
              <button
                key={t}
                onClick={() => navigate(`/venues?type=${t}`)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold whitespace-nowrap shrink-0 hover:shadow-sm transition-all hover:-translate-y-0.5',
                  color
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VENUES GRID ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-1">Trending Now</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy">Featured Venues</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/venues')} className="hidden sm:flex items-center gap-1.5 text-slate-600">
            View all <ArrowRight size={13} />
          </Button>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><PageSpinner /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredResult?.data.slice(0, 6).map((venue, i) => (
              <div key={venue.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <VenueCard venue={venue} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" onClick={() => navigate('/venues')} className="gap-1.5">
            View All Venues <ArrowRight size={14} />
          </Button>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-2">Browse by Type</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy">Every Kind of Venue</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.type}
                to={`/venues?type=${cat.type}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] block animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />
                <div className="absolute inset-0 bg-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <p className="text-white font-bold text-base leading-tight">{cat.label}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/65 text-xs">{cat.count}</span>
                    <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ChevronRight size={13} className="text-white" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="bg-navy py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-xs uppercase tracking-widest mb-2">Simple & Fast</p>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold text-white">Book in 4 Easy Steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '01', icon: <Search size={18} />, title: 'Search', desc: 'Browse by city, venue type, capacity, and date.' },
              { n: '02', icon: <Calendar size={18} />, title: 'Pick a Slot', desc: 'See real-time availability and choose your time.' },
              { n: '03', icon: <Shield size={18} />, title: 'Pay Securely', desc: 'UPI, cards or netbanking via Razorpay. Fully protected.' },
              { n: '04', icon: <Zap size={18} />, title: 'Get Confirmed', desc: 'Instant confirmation on email and SMS.' },
            ].map((s, i) => (
              <div key={s.n} className="relative bg-white/5 border border-white/8 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 group animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                {i < 3 && <div className="hidden lg:block absolute top-10 right-0 translate-x-1/2 w-8 h-px bg-white/12 z-10" />}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-10 h-10 bg-primary/15 border border-primary/25 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {s.icon}
                  </div>
                  <span className="font-display text-3xl font-bold text-white/7 group-hover:text-white/12 transition-colors">{s.n}</span>
                </div>
                <h3 className="font-bold text-white text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <CheckCircle size={18} className="text-primary" />, text: 'Verified Listings' },
              { icon: <Shield size={18} className="text-primary" />, text: 'Secure Payments' },
              { icon: <Users size={18} className="text-primary" />, text: 'Dedicated Support' },
              { icon: <Zap size={18} className="text-primary" />, text: 'Instant Confirmation' },
            ].map(t => (
              <div key={t.text} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">{t.icon}</div>
                <p className="text-sm font-semibold text-navy">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OWNER CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 pb-24 md:pb-16">
        <div className="relative rounded-3xl overflow-hidden">
          <img src="/resorts/sasha-kaunas-TAgGZWz6Qg8-unsplash.jpg" alt="List your venue" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/92 via-navy/80 to-navy/40" />
          <div className="relative z-10 px-8 sm:px-16 py-14 sm:py-20 max-w-xl">
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-3">For Venue Owners</p>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold text-white mb-4 leading-tight">
              Start Earning<br />From Your Venue
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-8">
              List your space on BookMyVenue and reach thousands of event planners across Kerala. Setup takes under 5 minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" onClick={() => navigate('/auth/register')} className="gap-2 shadow-lg shadow-accent/25">
                List Your Venue Free <ArrowRight size={14} />
              </Button>
              <Button variant="ghost" size="lg" onClick={() => navigate('/venues')} className="text-white hover:text-white hover:bg-white/10 border border-white/20">
                Browse Venues
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
