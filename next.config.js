const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.slack-edge.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    swcPlugins: [
      [
        'next-superjson-plugin',
        {
          excluded: [],
        },
      ],
    ],
    serverActions: {
      allowedOrigins: ['http://localhost:5001', 'test.kosmosry.fi'],
    },
  },
};

module.exports = withVanillaExtract(nextConfig);
