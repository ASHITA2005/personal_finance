/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Ensure server-side code is not bundled for client
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig

