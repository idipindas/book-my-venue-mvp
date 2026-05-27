import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, MapPin, Calendar, ArrowRight, Star, Shield, Zap,
  CheckCircle, Users, Building2, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { VenueCard } from '@/components/venue/VenueCard';
import { useVenues } from '@/hooks/useVenues';
import { VENUE_TYPE_LABELS, VenueType } from '@/types';
import { PageSpinner } from '@/components/ui/Spinner';

const venueTypeOptions = [
  { value: '', label: 'Any type' },
  ...Object.entries(VENUE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

const categories = [
  {
    type: VenueType.RESORT,
    label: 'Resorts & Hotels',
    img: '/resorts/paolo-nicolello-2gOxKj594nM-unsplash.jpg',
    gradient: 'from-teal-900/80 to-teal-600/40',
    count: '48 venues',
  },
  {
    type: VenueType.BIRTHDAY_HALL,
    label: 'Event Halls',
    img: '/halls/jeremy-wong-weddings-K8KiCHh4WU4-unsplash.jpg',
    gradient: 'from-violet-900/80 to-violet-600/40',
    count: '62 venues',
  },
  {
    type: VenueType.CAFE,
    label: 'Cafés & Restaurants',
    img: '/cafe/petr-sevcovic-qE1jxYXiwOA-unsplash.jpg',
    gradient: 'from-amber-900/80 to-amber-600/40',
    count: '35 venues',
  },
  {
    type: VenueType.MEETUP,
    label: 'Meeting Spaces',
    img: '/meeting-space/benjamin-child-GWe0dlVD9e0-unsplash.jpg',
    gradient: 'from-blue-900/80 to-blue-600/40',
    count: '27 venues',
  },
  {
    type: VenueType.AUDITORIUM,
    label: 'Auditoriums',
    img: '/halls/engin-akyurt-i3rFV6ULk-o-unsplash.jpg',
    gradient: 'from-rose-900/80 to-rose-600/40',
    count: '19 venues',
  },
  {
    type: VenueType.MALL,
    label: 'Malls & Spaces',
    img: '/mall/julia-taubitz-oQrC1ToY4xY-unsplash.jpg',
    gradient: 'from-slate-900/80 to-slate-600/40',
    count: '14 venues',
  },
];

const stats = [
  { value: '500+', label: 'Verified Venues' },
  { value: '10K+', label: 'Events Hosted' },
  { value: '14', label: 'Kerala Cities' },
  { value: '4.9★', label: 'Avg. Rating' },
];

const steps = [
  {
    n: '01',
    icon: <Search size={20} />,
    title: 'Search',
    desc: 'Browse by city, venue type, capacity, and date.',
  },
  {
    n: '02',
    icon: <Calendar size={20} />,
    title: 'Pick a Slot',
    desc: 'See real-time availability and choose your time.',
  },
  {
    n: '03',
    icon: <Shield size={20} />,
    title: 'Pay Securely',
    desc: 'UPI, cards or netbanking via Razorpay. Fully protected.',
  },
  {
    n: '04',
    icon: <Zap size={20} />,
    title: 'Get Confirmed',
    desc: 'Instant confirmation on email and SMS.',
  },
];

const gallery = [
  { img: '/resorts/sasha-kaunas-TAgGZWz6Qg8-unsplash.jpg', cls: 'col-span-2 row-span-2', label: 'Luxury Resorts' },
  { img: '/halls/omar-rodriguez-XYuNwlYtfLI-unsplash.jpg', cls: 'col-span-1 row-span-1', label: 'Grand Halls' },
  { img: '/cafe/daan-evers-tKN1WXrzQ3s-unsplash.jpg', cls: 'col-span-1 row-span-1', label: 'Cosy Cafés' },
  { img: '/meeting-space/rodeo-project-management-software-ONe-snuCaqQ-unsplash.jpg', cls: 'col-span-1 row-span-1', label: 'Work Spaces' },
  { img: '/mall/andy-wang-brqQcWhP7UI-unsplash.jpg', cls: 'col-span-1 row-span-1', label: 'Malls' },
];

export default function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');

  const { data: featuredResult, isLoading } = useVenues({ limit: 6, page: 1 });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    if (date) params.set('date', date);
    navigate(`/venues?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/resorts/anmol-seth-hDbCjHNdF48-unsplash.jpg')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/70 to-teal-900/60" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-32 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/85 text-sm mb-8 animate-fade-in">
            <Star size={12} className="text-accent fill-accent" />
            Kerala's #1 Venue Booking Platform
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] mb-6 animate-fade-up animate-stagger-1">
            Find the Perfect
            <span className="block italic text-accent">Venue in Kerala</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-up animate-stagger-2">
            From intimate cafés to grand auditoriums — discover, compare, and instantly
            book unique spaces for any occasion.
          </p>

          {/* Search bar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 max-w-3xl mx-auto animate-fade-up animate-stagger-3 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 flex-1 bg-white/10 hover:bg-white/15 transition-colors rounded-xl px-3 py-2.5">
                <MapPin size={15} className="text-white/50 shrink-0" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                >
                  <option value="" className="text-navy bg-white">Any city</option>
                  {['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kottayam', 'Munnar', 'Alappuzha'].map(
                    (c) => <option key={c} value={c} className="text-navy bg-white">{c}</option>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors rounded-xl px-3 py-2.5 sm:w-40">
                <Building2 size={15} className="text-white/50 shrink-0" />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-transparent text-white text-sm focus:outline-none"
                >
                  {venueTypeOptions.map((o) => (
                    <option key={o.value} value={o.value} className="text-navy bg-white">{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors rounded-xl px-3 py-2.5 sm:w-40">
                <Calendar size={15} className="text-white/50 shrink-0" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
                />
              </div>

              <Button size="lg" variant="accent" onClick={handleSearch} className="gap-2 shrink-0 font-semibold">
                <Search size={16} /> Search
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-10 animate-fade-up animate-stagger-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-40">
          <div className="w-5 h-8 border-2 border-white/40 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Browse by Type</p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-navy">
            Every Kind of Venue
          </h2>
          <p className="text-muted mt-3 max-w-lg mx-auto">
            Whether it's an intimate gathering or a grand celebration, we have the perfect space for you.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.type}
              to={`/venues?type=${cat.type}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] block animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} transition-opacity duration-300`} />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <p className="text-white font-bold text-lg leading-tight">{cat.label}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white/70 text-xs">{cat.count}</span>
                  <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ChevronRight size={14} className="text-white" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PHOTO GALLERY MOSAIC ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-1">Spaces</p>
            <h2 className="font-display text-4xl font-semibold text-navy">Stunning Venues Await</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/venues')} className="hidden sm:flex items-center gap-1.5">
            Explore all <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-3 grid-rows-2 gap-3 h-[480px]">
          {gallery.map((g, i) => (
            <div
              key={i}
              className={`relative rounded-2xl overflow-hidden group cursor-pointer ${g.cls}`}
              onClick={() => navigate('/venues')}
            >
              <img
                src={g.img}
                alt={g.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white font-semibold text-sm">{g.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED VENUES ──────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-1">Trending</p>
              <h2 className="font-display text-4xl font-semibold text-navy">Featured Venues</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/venues')} className="hidden sm:flex items-center gap-1.5">
              View all <ArrowRight size={14} />
            </Button>
          </div>

          {isLoading ? (
            <div className="py-16 flex justify-center"><PageSpinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResult?.data.slice(0, 6).map((venue, i) => (
                <div key={venue.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                  <VenueCard venue={venue} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate('/venues')}>
              View All Venues <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-navy py-24 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Simple & Fast</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white">Book in 4 Easy Steps</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="relative bg-white/5 border border-white/8 rounded-2xl p-7 hover:bg-white/8 transition-all duration-300 group animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 right-0 translate-x-1/2 w-8 h-px bg-white/15 z-10" />
                )}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 bg-primary/15 border border-primary/30 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {s.icon}
                  </div>
                  <span className="font-display text-3xl font-bold text-white/8 group-hover:text-white/15 transition-colors">{s.n}</span>
                </div>
                <h3 className="font-bold text-white text-base mb-2">{s.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 py-10 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: <CheckCircle size={20} className="text-primary" />, text: 'Verified Listings' },
              { icon: <Shield size={20} className="text-primary" />, text: 'Secure Payments' },
              { icon: <Users size={20} className="text-primary" />, text: 'Dedicated Support' },
              { icon: <Zap size={20} className="text-primary" />, text: 'Instant Confirmation' },
            ].map((t) => (
              <div key={t.text} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                  {t.icon}
                </div>
                <p className="text-sm font-semibold text-navy">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OWNER CTA ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="/resorts/sasha-kaunas-TAgGZWz6Qg8-unsplash.jpg"
            alt="List your venue"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/92 via-navy/80 to-navy/50" />
          <div className="relative z-10 px-10 sm:px-16 py-16 sm:py-20 max-w-xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-3">For Venue Owners</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-4 leading-tight">
              Start Earning<br />From Your Venue
            </h2>
            <p className="text-white/65 text-base leading-relaxed mb-8">
              List your space on BookMyVenue and reach thousands of event planners across Kerala.
              Setup takes under 5 minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" onClick={() => navigate('/auth/register')} className="gap-2">
                List Your Venue Free <ArrowRight size={15} />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/venues')}
                className="text-white hover:text-white hover:bg-white/10 border border-white/20"
              >
                Browse Venues
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
