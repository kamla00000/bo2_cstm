/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true // Vercel以外の静的デプロイ時に推奨
  },
};

export default nextConfig;