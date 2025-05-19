// tailwind.config.js

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        30: 'repeat(30, minmax(0, 1fr))',
      },
      spacing: {
        'slot-cell': '1.2rem',
      },
      // 🎨 カスタムアニメーションを追加（ここがポイント）
      animation: {
        'fast-pulse': 'pulse 0.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slow-pulse': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};