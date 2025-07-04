/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
        '30': 'repeat(30, minmax(0, 1fr))',
      },
      spacing: {
        'slot-cell': '1.2rem',
      },
      animation: {
        'fast-pulse': 'fast-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-once': 'ping-once 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fast-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        'ping-once': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.5', transform: 'scale(1)' },
        },
      },
      // --- SF蛍光オレンジ＆黄色＆オフホワイトネオンUI用カスタムカラー ---
      colors: {
        'neon-orange': '#ff9100',
        'neon-orange-strong': '#ffb300',
        'neon-orange-dark': '#df4600',
        'neon-yellow': '#FEDD0D',
        'neon-yellow-strong': '#ffe94d',
        'neon-yellow-dark': '#e6c200',
        'neon-offwhite': '#FFF79A',
        'neon-offwhite-strong': '#fffbcf',
        'neon-offwhite-dark': '#e6e08a',
        'sf-bg': '#181818',
        'sf-bg-dark': '#101010',
      },
      boxShadow: {
        'neon-orange-dark': '0 0 4px #df4600, 0 0 8px #df4600 inset',
        'neon-orange': '0 0 4px #ff9100, 0 0 8px #ff9100 inset',
        'neon-yellow': '0 0 4px #FEDD0D, 0 0 8px #FEDD0D inset',
        'neon-offwhite': '0 0 4px #FFF79A, 0 0 8px #FFF79A inset',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};