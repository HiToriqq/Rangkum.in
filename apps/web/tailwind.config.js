/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#334E68',
          600: '#243B53',
          700: '#1D3350',
          800: '#172A43', // Primary Navy
          900: '#0F1C2E',
          950: '#09111C',
        },
        terracotta: {
          50: '#FDF7F5',
          100: '#F9ECE7',
          200: '#F2D5CB',
          300: '#E7B6A4',
          400: '#D58E74',
          500: '#C5785C',
          600: '#B9684B', // Primary Terracotta
          700: '#9B5239',
          800: '#7E422E',
          900: '#673727',
        },
        bg: {
          base: '#F7F6F2',
          surface: '#FFFFFF',
          subtle: '#F2F0EB',
        },
        border: {
          DEFAULT: '#E7E3DA',
          subtle: '#EFECE6',
          strong: '#D3CDC0',
        },
        txt: {
          primary: '#202B38',
          muted: '#7D858C',
          light: '#A0A7AF',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(23, 42, 67, 0.04), 0 1px 2px -1px rgba(23, 42, 67, 0.04)',
        elevated: '0 4px 6px -1px rgba(23, 42, 67, 0.06), 0 2px 4px -2px rgba(23, 42, 67, 0.04)',
        hover: '0 10px 15px -3px rgba(23, 42, 67, 0.08), 0 4px 6px -4px rgba(23, 42, 67, 0.04)',
      },
    },
  },
  plugins: [],
}
