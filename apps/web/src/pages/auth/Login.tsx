import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { mutate: login, isPending } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur border border-white/20">
            <MapPin size={28} className="text-primary" />
          </div>
          <h2 className="font-display text-5xl font-semibold text-white mb-4">
            Welcome back
          </h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Sign in to manage your bookings, explore new venues across Kerala, and plan your next event.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {['500+ Venues', '10K+ Events', '4.9★ Rating'].map((s) => (
              <div key={s} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                <p className="text-white text-sm font-semibold">{s.split(' ')[0]}</p>
                <p className="text-white/50 text-xs mt-0.5">{s.split(' ').slice(1).join(' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-navy">BookMyVenue</span>
          </div>

          <h1 className="font-display text-3xl font-semibold text-navy mb-2">Sign in</h1>
          <p className="text-muted text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-primary hover:underline font-medium">
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit((d) => login(d))} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" fullWidth size="lg" loading={isPending}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted">
            Demo: <code className="bg-slate-200 px-1 py-0.5 rounded">testuser@example.com / password123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
