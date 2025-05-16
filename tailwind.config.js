/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // grid-cols-30 を使用可能にする
      gridTemplateColumns: {
        30: 'repeat(30, minmax(0, 1fr))',
      },
      // カスタムスペース：slot-cell（例：w-slot-cell）
      spacing: {
        'slot-cell': '1.2rem',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};