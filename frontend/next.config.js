/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
  images: {
    domains: ['localhost', 'via.placeholder.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig