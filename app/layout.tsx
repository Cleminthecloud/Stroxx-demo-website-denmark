import type { Metadata, Viewport } from 'next';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
        {/* keyboard users skip the fixed nav straight to the page content */}
        <a href="#indhold" className="skip-link">Skip to content</a>
        <SiteOverlay />
        <SmoothScroll>
          <Nav />
          <div id="indhold">{children}</div>
          <Footer />
          <SpecialistFab />
          <CommandMenu />
        </SmoothScroll>
      </body>
    </html>
  );
}
