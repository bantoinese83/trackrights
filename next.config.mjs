/** @type {{reactStrictMode: boolean, webpack: (function(*): any), experimental: {serverExternalPackages: string[]}, images: {domains: string[]}}} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  experimental: {
    serverExternalPackages: ['@react-pdf/renderer'],
  },
  images: {
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com'],
  },
};

export default nextConfig;
