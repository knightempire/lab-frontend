/** @type {import('next').NextConfig} */
import withPWAInit from 'next-pwa';

// Initialize `next-pwa` with PWA-specific options
const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

// Your regular Next.js config
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

// Wrap the Next.js config with the PWA-configured function
export default withPWA(nextConfig);