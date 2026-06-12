/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // lint is a build gate: broken or sloppy code can't reach a push
  eslint: { ignoreDuringBuilds: false },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.carl-ras.dk' },
      { protocol: 'https', hostname: 'assets.carl-ras.dk' },
      { protocol: 'https', hostname: 'cdn.prod.website-files.com' }
    ]
  }
};
export default nextConfig;
