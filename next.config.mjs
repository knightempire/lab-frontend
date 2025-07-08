/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // This is the proxy configuration
  async rewrites() {
    return [
      {
        // Source path: all requests starting with /api/ are matched
        source: '/api/:path*',
        
        // Destination: read from the .env.local file
        // The browser never sees this URL. This is a server-to-server rewrite.
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

// FIX IS HERE: Use 'export default' instead of 'module.exports'
export default nextConfig;
