import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#DBEAFE',
        },
        accent: {
          DEFAULT: '#F43F5E',
          dark: '#E11D48',
          light: '#FFE4E6',
        },
        navy: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
        },
        emerald: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#D1FAE5',
        },
        indigo: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
          light: '#EEF2FF',
        },
        amber: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FEF3C7',
        },
        surface: '#FFFFFF',
        border: '#E2E8F0',
        muted: '#94A3B8',
        success: '#10B981',
        error: '#DC2626',
        warning: '#F59E0B',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.3) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(244,63,94,0.15) 0%, transparent 50%), linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #1e3a8a 100%)',
        'card-gradient': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        'blue-gradient': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.10)',
        float: '0 8px 40px rgba(0,0,0,0.14)',
        glass: '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(37,99,235,0.08)',
        'blue-glow': '0 0 0 3px rgba(37,99,235,0.15)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
        'slide-in-right': 'slideInRight 0.35s ease both',
        'scale-in': 'scaleIn 0.3s ease both',
        'spin-slow': 'spin 1.4s linear infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
