import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // 出力ディレクトリを指定
    assetsDir: '', // 静的アセットのディレクトリ（public/ の中身をそのままコピー）
    rollupOptions: {
      input: 'index.html', // エントリーポイント
    },
  },
});