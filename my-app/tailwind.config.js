/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-navy': '#1A365D',
        'primary-blue': '#2B6CB0',
        'soft-teal': '#319795',
        'muted-teal': '#B2F5EA',
        'off-white': '#F7FAFC',
        'divider-gray': '#E2E8F0',
        'body-gray': '#4A5568',
        'muted-text': '#A0AEC0',
        'success-green': '#2F855A',
        'success-bg': '#F0FFF4',
        'error-red': '#C53030',
        'error-bg': '#FFF5F5',
        'warning-yellow': '#D69E2E',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'clinical': '0 1px 3px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}