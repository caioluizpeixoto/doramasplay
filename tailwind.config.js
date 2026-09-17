/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#08090c',
          surface: '#0e1016',
          elevated: '#151821',
          card: '#1b1f2b',
          'card-hover': '#242938',
          border: '#282d3f',
          muted: '#8b93a7',
          text: '#f1f3f9',
          subtext: '#b4bacb',
        },
        crimson: {
          DEFAULT: '#e50938',
          hover: '#ff1c4b',
          dark: '#b3072c',
          light: '#ff4d73',
          glow: 'rgba(229, 9, 56, 0.4)',
        },
        gold: {
          DEFAULT: '#e5a93b',
          hover: '#f5b94c',
          dark: '#b87e22',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'cinematic': '0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(229, 9, 56, 0.15)',
        'card-glow': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(229, 9, 56, 0.2)',
        'elevated': '0 8px 30px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, rgba(8,9,12,0.2) 0%, rgba(8,9,12,0.6) 50%, rgba(8,9,12,1) 100%)',
        'hero-side-gradient': 'linear-gradient(90deg, rgba(8,9,12,0.95) 0%, rgba(8,9,12,0.7) 45%, rgba(8,9,12,0) 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 40%, rgba(8,9,12,0.95) 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
