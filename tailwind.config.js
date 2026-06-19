/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        leaf: {
          50:  '#F0F6EC',
          100: '#DCE8D4',
          200: '#BAD4A8',
          500: '#4A8C3F',
          600: '#3A7030',
          700: '#2D5725',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'count-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'count-up':  'count-up 0.4s ease-out forwards',
        'fade-in':   'fade-in 0.5s ease-out forwards',
        'slide-up':  'slide-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
