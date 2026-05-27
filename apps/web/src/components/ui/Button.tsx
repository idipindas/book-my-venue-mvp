import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:scale-[0.98] shadow-sm hover:shadow-md',
  outline:
    'border border-border bg-white text-navy hover:border-primary hover:text-primary hover:bg-primary-light/30',
  ghost: 'text-slate-600 hover:text-navy hover:bg-slate-100',
  danger: 'bg-error text-white hover:bg-red-700 active:scale-[0.98]',
  accent: 'bg-accent text-navy font-semibold hover:bg-accent-dark active:scale-[0.98] shadow-sm',
};

const sizes = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin-slow shrink-0" size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
