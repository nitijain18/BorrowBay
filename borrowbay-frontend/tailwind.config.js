/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',  // main blue
          600: '#2563EB',  // darker blue (hover)
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: {
          500: '#6366F1',  // indigo
          600: '#4F46E5',
        }
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-in-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-down':  'slideDown 0.3s ease-out',
        'scale-in':    'scaleIn 0.3s ease-out',
        'pulse-slow':  'pulse 2s infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
      },
      boxShadow: {
        'card':       '0 2px 15px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(59,130,246,0.15)',
        'button':     '0 4px 14px rgba(59,130,246,0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}