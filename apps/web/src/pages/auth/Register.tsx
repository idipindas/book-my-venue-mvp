import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Mail, Lock, User, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegister } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['USER', 'OWNER']),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { mutate: register_, isPending } = useRegister();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'USER' },
  });

  const role = watch('role');

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur border border-white/20">
            <MapPin size={28} className="text-accent" />
          </div>
          <h2 className="font-display text-5xl font-semibold text-white mb-4">Join us today</h2>
          <p className="text-white/60 text-lg leading-relaxed">
            Create a free account and start exploring hundreds of venues — or list your own space and reach thousands of event planners.
          </p>
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

          <h1 className="font-display text-3xl font-semibold text-navy mb-2">Create account</h1>
          <p className="text-muted text-sm mb-6">
            Already have one?{' '}
            <Link to="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>

          {/* Role toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-200 rounded-xl">
            {(['USER', 'OWNER'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setValue('role', r)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
                  role === r
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-slate-500 hover:text-navy'
                )}
              >
                {r === 'USER' ? <User size={15} /> : <Building2 size={15} />}
                {r === 'USER' ? 'Book Venues' : 'List My Venue'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit((d) => register_(d))} className="space-y-4">
            <Input
              label="Full name"
              placeholder="Your full name"
              leftIcon={<User size={16} />}
              error={errors.name?.message}
              {...register('name')}
            />
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
              placeholder="Min. 8 characters"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              hint="Use at least 8 characters with a mix of letters and numbers"
              {...register('password')}
            />
            <Button type="submit" fullWidth size="lg" loading={isPending}>
              Create {role === 'OWNER' ? 'Owner' : ''} Account
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms</a> and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
