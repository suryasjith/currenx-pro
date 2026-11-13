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
        finance: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          primary: '#10B981',
          primaryHover: '#059669',
          accent: '#3B82F6',
          down: '#EF4444',
          up: '#10B981',
          textMuted: '#9CA3AF'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
