import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/ui.store';
import { Role, type User } from '@/types';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** Where each role lands after login / register */
const dashboardByRole: Record<Role, string> = {
  [Role.USER]:  '/dashboard',
  [Role.OWNER]: '/owner',
  [Role.ADMIN]: '/admin',
};

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<{ success: boolean; data: AuthResponse }>('/auth/login', data),
    onSuccess: ({ data }) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.name}!`);
      // honour ?next= for deep links, otherwise go to role dashboard
      const next = new URLSearchParams(window.location.search).get('next');
      navigate(next ?? dashboardByRole[user.role]);
    },
    onError: () => toast.error('Invalid email or password.'),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: string }) =>
      api.post<{ success: boolean; data: AuthResponse }>('/auth/register', data),
    onSuccess: ({ data }) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Account created! Welcome aboard.');
      navigate(dashboardByRole[user.role]);
    },
    onError: (err: { response?: { data?: { error?: { message?: string } } } }) =>
      toast.error(err?.response?.data?.error?.message ?? 'Registration failed.'),
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => api.post('/auth/logout', { refreshToken }),
    onSettled: () => {
      logout();
      navigate('/auth/login');
    },
  });
}
