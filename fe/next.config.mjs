/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // webpack: (config) => {
  //   config.resolve.alias.canvas = false;

  //   return config;
  // },
  webpack: (config, { isServer }) => {
    // Add custom extensions to Webpack's resolve configuration
    config.resolve.extensions.push('.js', '.jsx', '.ts', '.tsx', '.mjs');
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
