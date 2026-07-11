import type { Metadata } from 'next';
import { Suspense } from 'react';
import StoreFinder from '@/components/StoreFinder';
import { getSiteSettings } from '@/lib/cms';
import { getStores } from '@/lib/cms';
import { clock, type Store } from '@/lib/stores';
import { SITE_URL as BASE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Find your store',
  description:
    'Find your nearest STROXX stockist. 26 stores across Denmark with addresses, opening hours and a direct line to the store manager.',
  alternates: { canonical: '/stores' },
};

/** schema.org HardwareStore per stockist: name, address, geo and opening
 *  hours straight from the same store data the finder renders, so Google
 *  understands every store as a physical place that sells STROXX. Zip/city
 *  arrives as one string ("2730 Herlev"); split defensively. */
/* per-country phone prefix: store/manager phones are stored nationally-formatted */
const CALLING_CODE: Record<string, string> = { dk: '+45', de: '+49', fr: '+33', be: '+32' };
function telIntl(phone: string, country: string): string {
  const bare = phone.replace(/[\s.]/g, '');
  return bare.startsWith('+') ? bare : `${CALLING_CODE[country] ?? ''}${bare}`;
}

function storeLd(s: Store) {
  const [postalCode, ...cityParts] = s.zipCity.split(' ');
  const phone = s.manager?.phone || s.phone;
  return {
    '@type': 'HardwareStore',
    name: s.name,
    branchOf: { '@type': 'Organization', name: s.brand },
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address,
      postalCode,
      addressLocality: cityParts.join(' ') || s.zipCity,
      /* the store's own country — the finder carries all four markets' networks */
      addressCountry: (s.country || 'dk').toUpperCase(),
    },
    geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng },
    ...(phone ? { telephone: telIntl(phone, s.country || 'dk') } : {}),
    ...(s.monThu && s.fri
      ? {
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
              opens: clock(s.monThu[0]),
              closes: clock(s.monThu[1]),
            },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: clock(s.fri[0]), closes: clock(s.fri[1]) },
          ],
        }
      : {}),
    url: `${BASE}/stores`,
  };
}

/** Full-screen, app-like finder: the map IS the page. The global footer is
 *  hidden on this route via body:has(main.fullscreen-map) in globals.css. */
export default async function ButikkerPage() {
  const storeData = await getStores();
  const s = await getSiteSettings();
  const storesLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'STROXX stockists',
    itemListElement: storeData.map((st, i) => ({ '@type': 'ListItem', position: i + 1, item: storeLd(st) })),
  };
  return (
    <main className="fullscreen-map bg-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storesLd) }} />
      {/* StoreFinder reads useSearchParams (tab/q deep links) → needs Suspense */}
      <Suspense fallback={<div className="pt-40 text-center text-fog">Loading...</div>}>
        <StoreFinder storeData={storeData} headlineStores={s?.butikkerHeadlineStores} />
      </Suspense>
    </main>
  );
}
