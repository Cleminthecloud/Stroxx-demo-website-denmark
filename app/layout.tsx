import type { Metadata, Viewport } from 'next';
import { draftMode } from 'next/headers';
import Script from 'next/script';
import { stegaClean } from '@sanity/client/stega';
import { VisualEditing } from 'next-sanity/visual-editing';
import { SanityLive } from '@/sanity/lib/live';
import { getSiteSettings, getStores, cleanLinks, getMarkets } from '@/lib/cms';
import { getLocale } from '@/lib/locale';
import { assetUrl } from '@/sanity/lib/image';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Analytics from '@/components/Analytics';
import Nav from '@/components/Nav';
import DealerChooserProvider from '@/components/DealerChooser';
import Footer from '@/components/Footer';
import SpecialistFab from '@/components/SpecialistFab';
import ExitPreview from '@/components/ExitPreview';
import { NewsletterBand, NewsletterPopup } from '@/components/Newsletter';
import { SITE_URL, IS_DEMO } from '@/lib/site';

export async function generateMetadata(): Promise<Metadata> {
  /* Site-wide SEO defaults come from Site settings in the CMS; the values
     below are the fallbacks when a field is empty. */
  const s = await getSiteSettings();
  const title = stegaClean(s?.seoTitle) || 'STROXX | Premium tools, beastly low prices';
  const description =
    stegaClean(s?.seoDescription) ||
    'STROXX is exactly like all your expensive tools and good gear. It just does not cost nearly as much. Real value for money.';
  const og = stegaClean(s?.ogImage) || '/brand/og.jpg';
  return {
    // Demo domain; swap lib/site.ts when the production domain lands. Makes all
    // OG/twitter image and canonical URLs absolute.
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: '%s | STROXX',
    },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'STROXX',
      locale: 'en',
      images: [{ url: og, width: 1200, height: 630, alt: 'STROXX tools' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [og],
    },
    icons: {
      icon: [
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: '/icons/apple-touch-icon.png',
    },
    /* development mode: the vercel.app demo stays out of search engines;
       flips off automatically when SITE_URL becomes the real domain */
    ...(IS_DEMO ? { robots: { index: false, follow: false } } : {}),
    appleWebApp: {
      capable: true,
      title: 'STROXX',
      statusBarStyle: 'black-translucent',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#0B0C0E',
  /* lets the dark canvas run under the iPhone notch/home bar while
     env(safe-area-inset-*) keeps fixed UI out of the gesture zones */
  viewportFit: 'cover',
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
  const locale = await getLocale();
  const storeData = await getStores();
  const marketList = await getMarkets();
  const dealers = marketList.filter((m) => !m.isReference && m.dealerName);
  const currentDealer = marketList.find((m) => m.code === locale.market && m.dealerName) ?? null;
  const rawGtm = stegaClean(settings?.gtmId) || '';
  const gtmId = /^GTM-[A-Z0-9]+$/i.test(rawGtm) ? rawGtm.toUpperCase() : null;
  /* Cookiebot CMP from CMS: consent banner + auto-blocking of tracking until
     consent (Consent Mode v2). Strict UUID validation, same reasoning as GTM. */
  const rawCb = stegaClean(settings?.cookiebotId) || '';
  const cookiebotId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawCb) ? rawCb : null;
  /* newsletter: band above the footer + optional rules-driven popup */
  const nlOn = settings?.newsletterEnabled === true;
  const nlCopy = {
    headline: settings?.newsletterHeadline || 'Sharp offers, no spam.',
    text: settings?.newsletterText || 'The monthly lineup and the sharpest prices, straight to your inbox.',
    buttonLabel: settings?.newsletterButtonLabel || 'Sign up',
    disclaimer: settings?.newsletterDisclaimer || 'Unsubscribe anytime. We only write when it is worth your time.',
    success: settings?.newsletterSuccess || '',
  };
  /* chat microcopy from Site settings → Microcopy */
  const fabCopy = {
    fabLabel: settings?.chatFabLabel || '',
    panelHeadline: settings?.chatPanelHeadline || '',
    panelText: settings?.chatPanelText || '',
    greeting: settings?.chatGreeting || '',
    fallback: settings?.chatFallback || '',
  };
  return (
    <html lang={locale.htmlLang}>
      <body>
        {cookiebotId && (
          <Script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid={cookiebotId}
            data-blockingmode="auto"
            strategy="beforeInteractive"
          />
        )}
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
        <DealerChooserProvider currentDealer={currentDealer} dealers={dealers}>
        <SmoothScroll>
          <Nav links={cleanLinks(settings?.navLinks) ?? undefined} logoSrc={assetUrl(settings?.logo, 240) ?? undefined} />
          <div id="indhold">{children}</div>
          {nlOn && settings?.newsletterBandEnabled !== false && <NewsletterBand copy={nlCopy} />}
          <Footer />
          {/* editors can hide the chat entirely: Site settings → Integrations */}
          {settings?.chatEnabled !== false && <SpecialistFab storeData={storeData} copy={fabCopy} />}
        </SmoothScroll>
        </DealerChooserProvider>
        {/* first-party anonymous stats (no cookies): feeds the Studio Dashboard */}
        <Analytics />
        {/* Sanity: live content updates + click-to-edit overlays in draft mode */}
        <SanityLive />
        {draft && <VisualEditing />}
        {draft && <ExitPreview />}
        {nlOn && settings?.newsletterPopupEnabled === true && (
          <NewsletterPopup
            copy={nlCopy}
            delaySeconds={settings?.newsletterPopupDelay ?? 8}
            scrollPercent={settings?.newsletterPopupScroll ?? 50}
            frequencyDays={settings?.newsletterPopupFrequencyDays ?? 14}
          />
        )}
      </body>
    </html>
  );
}
