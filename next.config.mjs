/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/ads.txt',
        destination: '/api/ads',
      },
    ];
  },
};

// Only enable bundle analyzer when ANALYZE environment variable is set
const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
