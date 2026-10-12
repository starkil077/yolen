/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06080D',
          900: '#0C0F17',
          800: '#131824',
          700: '#1C2436',
          600: '#28334C',
        },
        cyan: {
          accent: '#00E5FF',
          glow: '#38bdf8',
        },
        violet: {
          accent: '#8B5CF6',
        },
        amber: {
          accent: '#FFB703',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
