/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A0F1E',
          900: '#0D1526',
          800: '#111827',
          700: '#1a2440',
          600: '#1E3A5F',
          500: '#254d7a',
        },
        blue: {
          primary: '#4F8EF7',
          hover: '#3a7de0',
          muted: '#2a4a7f',
        },
        green: {
          success: '#34D399',
        },
        amber: {
          warning: '#F59E0B',
        },
        red: {
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
