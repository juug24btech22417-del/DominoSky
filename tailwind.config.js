/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#000000',
        surface: {
          DEFAULT: '#000000',
          card: '#080808',
          subtle: '#0D0D0D',
          border: '#181818',
          hover: '#141414'
        },
        sky: {
          cyan: '#38BDF8', // Subdued steel/sky blue instead of neon
          blue: '#2563EB',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
          crimson: '#DC2626'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
