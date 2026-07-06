import type { Metadata } from 'next';
import { Suspense } from 'react';
import StoreFinder from '@/components/StoreFinder';
import { getSiteSettings } from '@/lib/cms';
import { getStores } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Find your store',
  description:
    'Find your nearest STROXX stockist. 26 stores across Denmark with addresses, opening hours and a direct line to the store manager.',
  alternates: { canonical: '/butikker' },
};

/** Full-screen, app-like finder: the map IS the page. The global footer is
 *  hidden on this route via body:has(main.fullscreen-map) in globals.css. */
export default async function ButikkerPage() {
  const storeData = await getStores();
  const s = await getSiteSettings();
  return (
    <main className="fullscreen-map bg-ink">
      {/* StoreFinder reads useSearchParams (tab/q deep links) → needs Suspense */}
      <Suspense fallback={<div className="pt-40 text-center text-fog">Loading...</div>}>
        <StoreFinder storeData={storeData}  headlineStores={s?.butikkerHeadlineStores} headlineSpecialists={s?.butikkerHeadlineSpecialists} />
      </Suspense>
    </main>
  );
}
