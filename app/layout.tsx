import type { Metadata, Viewport } from 'next';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SpecialistFab from '@/components/SpecialistFab';
import CommandMenu from '@/components/CommandMenu';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  // Demo domain; swap lib/site.ts when the production domain lands. Makes all
  // OG/twitter image and canonical URLs absolute.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'STROXX — Dyrt værktøj til udyr pris',
    template: '%s — STROXX',
  },
  description:
    'STROXX er fuldstændigt ligesom alt dit dyre værktøj og gode gear. Det koster bare ikke nær så meget. Value for money, som man siger på godt dansk.',
  openGraph: {
    title: 'STROXX — Dyrt værktøj til udyr pris',
    description: 'Fedt værktøj til temmelig tynde priser. Kun hos Carl Ras.',
    type: 'website',
    siteName: 'STROXX',
    locale: 'da_DK',
    images: [{ url: '/brand/og.jpg', width: 1200, height: 630, alt: 'STROXX værktøj' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STROXX — Dyrt værktøj til udyr pris',
    description: 'Fedt værktøj til temmelig tynde priser. Kun hos Carl Ras.',
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
  slogan: 'Dyrt værktøj til udyr pris',
  description:
    'STROXX er professionelt værktøj uden mærke-tillæg, udviklet af fagfolk i Danmark, Tyskland, Frankrig og Belgien. Forhandles i Danmark eksklusivt af Carl Ras, med 30 dages tilfredshedsgaranti.',
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
  inLanguage: 'da',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/produkter?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
        {/* keyboard users skip the fixed nav straight to the page content */}
        <a href="#indhold" className="skip-link">Spring til indhold</a>
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
