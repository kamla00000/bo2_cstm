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
        'fast-pulse': 'fast-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite', // キーフレーム名'fast-pulse'を参照
        'ping-once': 'ping-once 1s cubic-bezier(0.4, 0, 0.6, 1) infinite', // キーフレーム名'ping-once'を参照
      },
      // カスタムキーフレームを定義
      keyframes: {
        'fast-pulse': { // 緑の点滅
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        'ping-once': { // 黄色の点滅 (fast-pulse と同じ挙動)
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.5', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};