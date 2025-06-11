// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        // 既存の30に加えて、16列の定義を追加します
        '16': 'repeat(16, minmax(0, 1fr))', // ★ 追加する行 ★
        '30': 'repeat(30, minmax(0, 1fr))',
      },
      spacing: {
        'slot-cell': '1.2rem',
      },
      // 🎨 カスタムアニメーション
      animation: {
        'fast-pulse': 'fast-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-once': 'ping-once 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // カスタムキーフレーム
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
      // カスタムフォントファミリー
      fontFamily: {
        'zen-old-mincho': ['"Zen Old Mincho"', 'serif'],
        'noto-sans': ['"Noto Sans JP"', 'sans-serif'],
      }
    },
    // extend の外側、theme の直下に fontWeight を追加/上書き (一旦コメントアウト)
    // fontWeight: {
    //   thin: '700',
    //   extralight: '700',
    //   light: '700',
    //   normal: '700',
    //   medium: '700',
    //   semibold: '700',
    //   bold: '700',
    //   extrabold: '700',
    //   black: '700',
    // }
  },
  plugins: [],
  darkMode: 'class',
};