/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#050507', 900: '#0a0a0e', 850: '#0f0f15', 800: '#14141c', 700: '#1d1d28', 600: '#2a2a38' },
        ember: { 300: '#ffb57a', 400: '#ff9447', 500: '#ff7a1a', 600: '#e5620a' },
        volt: { 400: '#8b8cff', 500: '#6d6cf7' },
        aqua: { 400: '#5cc8ff' },
        mist: { 100: '#f4f4f6', 300: '#c9c9d4', 400: '#a3a3b4', 500: '#7c7c8f' },
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: { tightest: '-0.055em' },
    },
  },
  plugins: [],
}
