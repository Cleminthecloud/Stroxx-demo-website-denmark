/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // /guide reads the editor-guide markdown at runtime; make sure Vercel ships it
  outputFileTracingIncludes: { '/guide': ['./docs/STROXX-editor-guide.md'] },
  // Next 16 removed lint-from-build; the gate is now `npm run check` pre-push
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.carl-ras.dk' },
      { protocol: 'https', hostname: 'assets.carl-ras.dk' },
      { protocol: 'https', hostname: 'cdn.prod.website-files.com' }
    ]
  }
};
export default nextConfig;
