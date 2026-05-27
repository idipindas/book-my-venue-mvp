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
          DEFAULT: '#0D9488',
          dark: '#0F766E',
          light: '#CCFBF1',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FEF3C7',
        },
        navy: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
        },
        surface: '#FFFFFF',
        border: '#E2E8F0',
        muted: '#94A3B8',
        success: '#059669',
        error: '#DC2626',
        warning: '#D97706',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(13,148,136,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(245,158,11,0.12) 0%, transparent 50%), linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #134E4A 100%)',
        'card-gradient': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        'teal-gradient': 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.1)',
        float: '0 8px 40px rgba(0,0,0,0.14)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
        'slide-in-right': 'slideInRight 0.35s ease both',
        'scale-in': 'scaleIn 0.3s ease both',
        'spin-slow': 'spin 1.4s linear infinite',
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
      },
    },
  },
  plugins: [],
} satisfies Config;
