/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.carl-ras.dk' },
      { protocol: 'https', hostname: 'assets.carl-ras.dk' },
      { protocol: 'https', hostname: 'cdn.prod.website-files.com' }
    ]
  },
  transpilePackages: ['three']
};
export default nextConfig;
