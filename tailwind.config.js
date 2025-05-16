/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // 🔧 クォートを修正
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        30: 'repeat(30, minmax(0, 1fr))',
      },
      spacing: {
        'slot-cell': '1.2rem',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};