import { NavLink } from 'react-router-dom';
import { Home, Compass, CalendarDays, UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/',                  label: 'Home',     icon: Home,        end: true },
  { to: '/venues',            label: 'Explore',  icon: Compass,     end: false },
  { to: '/dashboard/bookings',label: 'Bookings', icon: CalendarDays,end: false },
  { to: '/dashboard',         label: 'Profile',  icon: UserCircle,  end: true },
];

export function BottomNav() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch h-16 safe-area-bottom">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-all duration-200 relative',
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full" />
                )}
                <div className={cn(
                  'w-9 h-6 flex items-center justify-center rounded-full transition-all duration-200',
                  isActive ? 'bg-primary/10' : ''
                )}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
