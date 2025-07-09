import './globals.css';

export const metadata = {
  title: 'bo2_cstm Next.js版',
  description: 'カスタムパーツシミュレーター（Next.js App Router）',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
