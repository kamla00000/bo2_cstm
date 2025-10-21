// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist', // 出力ディレクトリ
    assetsDir: 'assets', // 静的アセットの保存先（デフォルトと同じ）
    rollupOptions: {
      input: 'index.html', // エントリーポイント
    },
  },
});