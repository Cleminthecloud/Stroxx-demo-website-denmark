import type { Metadata, Viewport } from 'next';
import { draftMode } from 'next/headers';
import Script from 'next/script';
import { stegaClean } from '@sanity/client/stega';
import { VisualEditing } from 'next-sanity/visual-editing';
import { SanityLive } from '@/sanity/lib/live';
import { getSiteSettings } from '@/lib/cms';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SpecialistFab from '@/components/SpecialistFab';
import CommandMenu from '@/components/CommandMenu';
import SiteOverlay from '@/components/SiteOverlay';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  // Demo domain; swap lib/site.ts when the production domain lands. Makes all
  // OG/twitter image and canonical URLs absolute.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'STROXX | Premium tools, beastly low prices',
    template: '%s | STROXX',
  },
  description:
    'STROXX is exactly like all your expensive tools and good gear. It just does not cost nearly as much. Real value for money.',
  openGraph: {
    title: 'STROXX | Premium tools, beastly low prices',
    description: 'Great tools at refreshingly low prices. Only at Carl Ras.',
    type: 'website',
    siteName: 'STROXX',
    locale: 'en',
    images: [{ url: '/brand/og.jpg', width: 1200, height: 630, alt: 'STROXX tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STROXX | Premium tools, beastly low prices',
    description: 'Great tools at refreshingly low prices. Only at Carl Ras.',
    images: ['/brand/og.jpg'],
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'STROXX',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0C0E',
};

const BASE = SITE_URL;

/* Site-wide structured data: who STROXX is (Organization, with Carl Ras as
   the exclusive Danish retailer) and how to search the site (WebSite +
   SearchAction → /produkter?q=). Product pages add Product + Breadcrumb LD,
   /proev-det adds FAQ + HowTo. */
const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'STROXX',
  url: BASE,
  logo: `${BASE}/icons/icon-512.png`,
  slogan: 'Premium tools, beastly low prices',
  description:
    'STROXX is professional tools without the brand markup, developed by trade experts in Denmark, Germany, France and Belgium. Sold in Denmark exclusively by Carl Ras, with a 30-day satisfaction guarantee.',
  sameAs: ['https://www.carl-ras.dk/maerker/stroxx'],
  parentOrganization: {
    '@type': 'Organization',
    name: 'Carl Ras A/S',
    telephone: '+45 44 85 55 11',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mileparken 31',
      postalCode: '2730',
      addressLocality: 'Herlev',
      addressCountry: 'DK',
    },
  },
};
const siteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'STROXX',
  url: BASE,
  inLanguage: 'en',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/produkter?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const draft = (await draftMode()).isEnabled;
  /* GTM container from CMS siteSettings: tags/pixels/analytics change without
     a deploy. Strict GTM-XXXX validation so a CMS string can never inject
     arbitrary script. Production adds a CMP + Consent Mode v2 in front. */
  const settings = await getSiteSettings();
  const rawGtm = stegaClean(settings?.gtmId) || '';
  const gtmId = /^GTM-[A-Z0-9]+$/i.test(rawGtm) ? rawGtm.toUpperCase() : null;
  return (
    <html lang="en">
      <body>
        {gtmId && (
          <>
            <Script
              id="gtm"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
              }}
            />
            <noscript>
              {/* eslint-disable-next-line @next/next/no-sync-scripts */}
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
                title="gtm"
              />
            </noscript>
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
        {/* keyboard users skip the fixed nav straight to the page content */}
        <a href="#indhold" className="skip-link">Skip to content</a>
        {/* the placeholder overlay would cover the Presentation preview iframe */}
        {!draft && <SiteOverlay />}
        <SmoothScroll>
          <Nav />
          <div id="indhold">{children}</div>
          <Footer />
          <SpecialistFab />
          <CommandMenu />
        </SmoothScroll>
        {/* Sanity: live content updates + click-to-edit overlays in draft mode */}
        <SanityLive />
        {draft && <VisualEditing />}
      </body>
    </html>
  );
}
