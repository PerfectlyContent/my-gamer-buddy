/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gaming: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a2e',
          border: '#2a2a3e',
          text: '#e0e0e0',
          muted: '#8888aa',
          blue: '#00d4ff',
          teal: '#00b4d8',
          green: '#39ff14',
          purple: '#8b5cf6',
          pink: '#ff006e',
          orange: '#ff6b00',
          red: '#ff3333',
        },
      },
      fontFamily: {
        gaming: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(0, 212, 255, 0.25), 0 0 40px rgba(0, 212, 255, 0.10)',
        'glow-teal-sm': '0 0 10px rgba(0, 212, 255, 0.20)',
        'glow-teal-lg': '0 0 30px rgba(0, 212, 255, 0.35), 0 0 60px rgba(0, 212, 255, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px var(--glow-color, #00d4ff)' },
          '50%': { boxShadow: '0 0 20px var(--glow-color, #00d4ff)' },
        },
        'fill-bar': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--fill-width)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse-soft': {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 8px var(--glow-color, #00d4ff)' },
          '50%': { opacity: '1', boxShadow: '0 0 24px var(--glow-color, #00d4ff), 0 0 40px rgba(0, 212, 255, 0.25)' },
        },
        'stagger-up': {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'gradient-spin': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fill-bar': 'fill-bar 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow-pulse-soft': 'glow-pulse-soft 2s ease-in-out infinite',
        'stagger-up': 'stagger-up 0.4s ease-out forwards',
        'gradient-spin': 'gradient-spin 4s ease infinite',
      },
    },
  },
  plugins: [],
};
