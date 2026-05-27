import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Menu, X, MapPin, LayoutDashboard, LogOut, CalendarDays,
  Building2, ChevronDown, BarChart3, ShieldCheck, Users,
  Plus, Home,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { Role } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

/* ─── Role colours ─────────────────────────────────────────── */
const roleColors: Record<Role, string> = {
  [Role.USER]:  'bg-sky-500',
  [Role.OWNER]: 'bg-primary',
  [Role.ADMIN]: 'bg-violet-600',
};
const roleBadge: Record<Role, string> = {
  [Role.USER]:  'Member',
  [Role.OWNER]: 'Venue Owner',
  [Role.ADMIN]: 'Admin',
};

/* ─── Per-role nav links shown INSIDE the top bar ──────────── */
const authNavLinks: Record<Role, { to: string; label: string; icon: React.ReactNode }[]> = {
  [Role.USER]: [
    { to: '/dashboard',          label: 'Overview',    icon: <LayoutDashboard size={15} /> },
    { to: '/dashboard/bookings', label: 'My Bookings', icon: <CalendarDays size={15} /> },
    { to: '/venues',             label: 'Find Venues', icon: <MapPin size={15} /> },
  ],
  [Role.OWNER]: [
    { to: '/owner',           label: 'Dashboard',  icon: <LayoutDashboard size={15} /> },
    { to: '/owner/venues',    label: 'My Venues',  icon: <Building2 size={15} /> },
    { to: '/owner/bookings',  label: 'Bookings',   icon: <CalendarDays size={15} /> },
    { to: '/owner/analytics', label: 'Analytics',  icon: <BarChart3 size={15} /> },
  ],
  [Role.ADMIN]: [
    { to: '/admin',                label: 'Dashboard',  icon: <LayoutDashboard size={15} /> },
    { to: '/admin/venues/pending', label: 'Pending',    icon: <ShieldCheck size={15} /> },
    { to: '/admin/users',          label: 'Users',      icon: <Users size={15} /> },
    { to: '/admin/analytics',      label: 'Analytics',  icon: <BarChart3 size={15} /> },
  ],
};

/* ─── Guest nav links ───────────────────────────────────────── */
const guestNav = [
  { to: '/venues',                   label: 'Explore Venues' },
  { to: '/venues?type=resort',       label: 'Resorts' },
  { to: '/venues?type=auditorium',   label: 'Events' },
  { to: '/venues?type=birthday_hall',label: 'Celebrations' },
];

/* ─── Avatar dropdown (desktop) ─────────────────────────────── */
function AvatarMenu() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;
  const rc = roleColors[user.role];

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-white/10 hover:bg-white/18 border border-white/15 hover:border-white/30 transition-all"
      >
        <div className={`w-7 h-7 rounded-lg ${rc} flex items-center justify-center text-white text-xs font-bold`}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-white text-xs font-semibold leading-tight">{user.name.split(' ')[0]}</p>
          <p className="text-white/45 text-[10px] leading-tight">{roleBadge[user.role]}</p>
        </div>
        <ChevronDown size={12} className={cn('text-white/50 ml-0.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-float border border-slate-100 overflow-hidden z-50 animate-scale-in">
          {/* Profile strip */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-50 border-b border-slate-100">
            <div className={`w-9 h-9 rounded-lg ${rc} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy truncate">{user.name}</p>
              <p className="text-xs text-muted truncate">{user.email}</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="py-1.5">
            {authNavLinks[user.role].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy transition-colors"
              >
                <span className="text-primary">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            {user.role === Role.OWNER && (
              <Link
                to="/owner/venues/new"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy transition-colors"
              >
                <span className="text-accent"><Plus size={15} /></span>
                Add Venue
              </Link>
            )}
          </div>

          <div className="h-px bg-slate-100 mx-3" />

          <div className="py-1.5">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Navbar ────────────────────────────────────────────── */
export function Navbar() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isAuth = !!user;
  const navItems = isAuth ? authNavLinks[user.role] : guestNav;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-30 transition-all duration-300',
        scrolled ? 'bg-navy/96 backdrop-blur-md shadow-xl' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/30">
            <MapPin size={15} className="text-white" />
          </div>
          <span className="font-display text-white text-xl font-semibold hidden sm:block">
            BookMyVenue
          </span>
        </Link>

        {/* Desktop nav — switches based on auth */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {isAuth ? (
            /* Authenticated: role-specific tab-style links */
            authNavLinks[user.role].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/owner' || item.to === '/admin'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))
          ) : (
            /* Guest: explore links */
            guestNav.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/8'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))
          )}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2 ml-auto shrink-0">
          {isAuth ? (
            <>
              {user.role === Role.OWNER && (
                <Link to="/owner/venues/new">
                  <Button size="sm" variant="accent" className="gap-1.5 shadow-md">
                    <Plus size={14} /> Add Venue
                  </Button>
                </Link>
              )}
              <AvatarMenu />
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button size="sm" className="shadow-lg shadow-primary/30">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/80 hover:bg-white/10 transition-colors ml-auto"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-navy/98 backdrop-blur-md border-t border-white/8 px-4 py-4 space-y-1 animate-fade-in">
          {isAuth ? (
            <>
              {/* User badge */}
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/6 mb-3">
                <div className={`w-10 h-10 rounded-xl ${roleColors[user.role]} flex items-center justify-center text-white font-bold`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{user.name}</p>
                  <p className="text-white/40 text-xs">{user.email}</p>
                </div>
              </div>

              {/* Auth nav links */}
              {authNavLinks[user.role].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard' || item.to === '/owner' || item.to === '/admin'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/8'
                    )
                  }
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}

              {user.role === Role.OWNER && (
                <Link
                  to="/owner/venues/new"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-accent hover:bg-white/8 transition-colors"
                >
                  <Plus size={15} /> Add New Venue
                </Link>
              )}

              <div className="h-px bg-white/8 my-2" />

              <button
                onClick={() => { setMobileOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <>
              {guestNav.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/6'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="h-px bg-white/10 my-2" />
              <div className="flex gap-2 pt-1">
                <Link to="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" fullWidth className="border-white/20 text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button fullWidth>Get Started</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
