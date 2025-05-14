/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        // 30分割ゲージ用
        30: 'repeat(30, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};