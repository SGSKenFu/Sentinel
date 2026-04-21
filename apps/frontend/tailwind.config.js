/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    '../../packages/ui-components/src/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        sentinel: {
          50: '#f0f4ff',
          100: '#e0eaff',
          500: '#4f6ef7',
          600: '#3b55e6',
          700: '#2d42c9',
          900: '#1a2680',
        },
        risk: {
          high: '#ef4444',
          medium: '#f97316',
          low: '#eab308',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
