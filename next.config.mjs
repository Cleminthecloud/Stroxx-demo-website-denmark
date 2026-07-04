/** @type {import('next').NextConfig} */
const nextConfig = {
  /* iCloud (the repo lives in ~/Documents) syncs .next and corrupts it with
     " 2" duplicate dirs mid-build. Folders named *.nosync are excluded from
     iCloud sync entirely, which makes local builds deterministic again.
     Vercel is unaffected (no iCloud) and respects distDir. */
  distDir: '.next.nosync',
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
  },
  /* Security headers (IT-approval baseline). Deliberately NOT a full CSP yet:
     GTM + Cookiebot inject scripts at runtime and a hasty CSP breaks them;
     CSP ships as its own tested change (see status doc, security section).
     X-Frame-Options SAMEORIGIN still allows the Studio's Presentation iframe
     (same origin) while blocking third-party embedding/clickjacking. */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' }
        ]
      }
    ];
  }
};
export default nextConfig;
