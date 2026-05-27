import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Role } from '@/types';

interface ProtectedRouteProps {
  role?: Role | Role[];
}

const dashboardByRole: Record<Role, string> = {
  [Role.USER]:  '/dashboard',
  [Role.OWNER]: '/owner',
  [Role.ADMIN]: '/admin',
};

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  // Not logged in → send to login with ?next= so they return after auth
  if (!user) {
    return <Navigate to={`/auth/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) {
      return <Navigate to={dashboardByRole[user.role]} replace />;
    }
  }

  return <Outlet />;
}
