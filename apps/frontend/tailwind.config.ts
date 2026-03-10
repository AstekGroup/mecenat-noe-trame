import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs du design system Noé - Trame Pollinisateur
        primary: {
          DEFAULT: '#122E22',
          dark: '#0a1a13',
          light: '#1e4d39',
        },
        accent: {
          coral: '#D64203',
          'coral-dark': '#b03602',
          magenta: '#cc3366',
        },
        surface: {
          beige: '#ffeed1',
          'beige-light': '#fff8eb',
          white: '#ffffff',
        },
        text: {
          primary: '#122E22',
          secondary: '#69727d',
          light: '#ffffff',
        }
      },
      fontFamily: {
        rubik: ['Rubik', 'sans-serif'],
        palanquin: ['Palanquin', 'sans-serif'],
      },
      fontSize: {
        'hero': ['3.75rem', { lineHeight: '1', fontWeight: '600' }],
        'title': ['2.5rem', { lineHeight: '1', fontWeight: '600' }],
        'subtitle': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
      },
      borderRadius: {
        'button': '5px',
        'card': '12px',
        'cluster': '50%',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 48, 129, 0.1), 0 2px 4px -2px rgba(0, 48, 129, 0.1)',
        'popup': '0 10px 25px -5px rgba(0, 48, 129, 0.2), 0 8px 10px -6px rgba(0, 48, 129, 0.1)',
        'cluster': '0 2px 10px rgba(245, 100, 118, 0.4)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
