/** @type {import('next').NextConfig} */
const nextConfig = {
  /* iCloud (the repo lives in ~/Documents) syncs .next and corrupts it with
     " 2" duplicate dirs mid-build. Folders named *.nosync are excluded from
     iCloud sync entirely, which makes local builds deterministic again.
     ON VERCEL the dist dir MUST stay the default ".next": the deploy step
     hardcodes ".next/routes-manifest.json" and a custom distDir fails the
     deployment AFTER a green build (proven Jul 4: six straight Error deploys).
     Hence: .nosync locally, .next in CI/Vercel. */
  distDir: process.env.VERCEL ? '.next' : '.next.nosync',
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
  /* Security headers (IT-approval baseline) + the full Content-Security-Policy
     (shipped Jul 6 for the autumn pen test). The CSP is an explicit allowlist
     of every origin the browser legitimately talks to:
       scripts   GTM + Cookiebot (marketing adds tags INSIDE GTM; a tag that
                 loads from a brand-new origin needs a line here, on purpose)
       connect   Sanity APIs (live content + Studio, incl. websockets),
                 GA4/consent beacons, DAWA postcode lookup
       img       product CDNs, Sanity assets, Carto map tiles, YouTube posters
       frame     the embed-block allowlist (keep in sync w/ EmbedFrame.tsx!)
     'unsafe-inline' for scripts/styles is the pragmatic Next.js baseline (no
     nonce infra) and 'unsafe-eval' keeps the embedded Sanity Studio alive
     (try removing it after a Studio smoke test some quiet day); the win is
     everything else: no foreign script origins, no object/embed, no form
     exfil, no clickjacking. Violations report to
     /api/csp-report → Vercel logs. X-Frame-Options SAMEORIGIN still allows
     the Studio's Presentation iframe while blocking third-party embedding. */
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://consent.cookiebot.com https://consentcdn.cookiebot.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.carl-ras.dk https://assets.carl-ras.dk https://cdn.sanity.io https://cdn.prod.website-files.com https://*.basemaps.cartocdn.com https://i.ytimg.com https://www.googletagmanager.com https://*.google-analytics.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.api.sanity.io wss://*.api.sanity.io https://*.apicdn.sanity.io https://api.dataforsyningen.dk https://*.google-analytics.com https://*.analytics.google.com https://consentcdn.cookiebot.com https://www.googletagmanager.com",
      "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://www.google.com https://docs.google.com https://forms.office.com https://form.typeform.com https://consentcdn.cookiebot.com https://*.carl-ras.dk https://*.stroxx.eu",
      "media-src 'self' https:",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'report-uri /api/csp-report',
    ].join('; ');
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
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
