import { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Building2, BarChart3, Users,
  ShieldCheck, MapPin, LogOut, Menu, X, Plus, Bell,
  ChevronRight, Sparkles, Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { Role } from '@/types';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const userNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={17} />, end: true },
  { to: '/dashboard/bookings', label: 'My Bookings', icon: <CalendarDays size={17} /> },
];

const ownerNav: NavItem[] = [
  { to: '/owner', label: 'Overview', icon: <LayoutDashboard size={17} />, end: true },
  { to: '/owner/venues', label: 'My Venues', icon: <Building2 size={17} /> },
  { to: '/owner/bookings', label: 'Bookings', icon: <CalendarDays size={17} /> },
  { to: '/owner/availability', label: 'Time Slots', icon: <Clock size={17} /> },
  { to: '/owner/analytics', label: 'Analytics', icon: <BarChart3 size={17} /> },
];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={17} />, end: true },
  { to: '/admin/venues/pending', label: 'Pending Venues', icon: <ShieldCheck size={17} /> },
  { to: '/admin/users', label: 'User Management', icon: <Users size={17} /> },
  { to: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={17} /> },
];

const navByRole: Record<Role, NavItem[]> = {
  [Role.USER]: userNav,
  [Role.OWNER]: ownerNav,
  [Role.ADMIN]: adminNav,
};

const roleConfig: Record<Role, { label: string; color: string; bg: string }> = {
  [Role.USER]: { label: 'Member', color: 'text-sky-300', bg: 'bg-sky-500/15' },
  [Role.OWNER]: { label: 'Venue Owner', color: 'text-teal-300', bg: 'bg-teal-500/15' },
  [Role.ADMIN]: { label: 'Administrator', color: 'text-violet-300', bg: 'bg-violet-500/15' },
};

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/bookings': 'My Bookings',
  '/owner': 'Overview',
  '/owner/venues': 'My Venues',
  '/owner/venues/new': 'Add Venue',
  '/owner/bookings': 'Bookings',
  '/owner/availability': 'Manage Time Slots',
  '/owner/analytics': 'Analytics',
  '/admin': 'Overview',
  '/admin/venues/pending': 'Pending Venues',
  '/admin/users': 'User Management',
  '/admin/analytics': 'Analytics',
};

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const nav = user ? navByRole[user.role] : [];
  const role = user?.role;
  const rc = role ? roleConfig[role] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 shrink-0">
        <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <MapPin size={16} className="text-white" />
          </div>
          <div>
            <span className="font-display text-white text-lg font-semibold leading-none block">BookMyVenue</span>
            <span className="text-white/30 text-[10px] leading-none">Kerala's #1 Venue Platform</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white lg:hidden transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role badge */}
      {rc && (
        <div className="mx-4 mb-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${rc.bg}`}>
            <Sparkles size={12} className={rc.color} />
            <span className={`text-xs font-semibold ${rc.color}`}>{rc.label} Dashboard</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-0.5">
        <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest px-3 pb-2 pt-1">
          Navigation
        </p>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-white/50 hover:text-white hover:bg-white/6'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('transition-transform', isActive ? '' : 'group-hover:translate-x-0.5')}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={13} className="opacity-60" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Owner quick actions */}
        {role === Role.OWNER && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest px-3 pb-2">
                Quick Actions
              </p>
            </div>
            <NavLink
              to="/owner/venues/new"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive ? 'bg-accent text-navy' : 'text-white/50 hover:text-white hover:bg-white/6'
                )
              }
            >
              <Plus size={17} />
              Add New Venue
            </NavLink>
            <NavLink
              to="/owner/availability"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive ? 'bg-primary text-white' : 'text-white/50 hover:text-white hover:bg-white/6'
                )
              }
            >
              <Clock size={17} />
              Set Time Slots
            </NavLink>
          </>
        )}

        <div className="pt-4 pb-1">
          <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest px-3 pb-2">
            Explore
          </p>
        </div>
        <NavLink
          to="/venues"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/6 transition-all duration-150"
        >
          <MapPin size={17} />
          Browse Venues
        </NavLink>
      </nav>

      {/* Divider */}
      <div className="h-px bg-white/8 mx-4 mb-3 shrink-0" />

      {/* User card */}
      <div className="px-3 pb-4 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-primary/30">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">{user?.name}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out"
            className="text-white/25 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10 shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();
  const title = pageTitles[location.pathname] ?? 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-navy shrink-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-navy flex flex-col lg:hidden animate-slide-in-right">
            <SidebarContent onClose={() => setOpen(false)} />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 px-5 sm:px-8 h-16 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-slate-500 hover:text-navy transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-navy truncate">{title}</h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Notifications bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 hover:text-navy transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-navy leading-tight">{user?.name.split(' ')[0]}</p>
                <p className="text-[11px] text-muted">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
