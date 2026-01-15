const withNextIntl = require('next-intl/plugin')(
  './src/i18n.ts' // Путь к твоему конфигурационному файлу
);

/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = withNextIntl(nextConfig);