import type { Metadata } from 'next';
import { Suspense } from 'react';
import StoreFinder from '@/components/StoreFinder';
import { getStores } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Find your store',
  description:
    'Find your nearest STROXX stockist. 26 stores across Denmark with addresses, opening hours and a direct line to the store manager.',
};

/** Full-screen, app-like finder: the map IS the page. The global footer is
 *  hidden on this route via body:has(main.fullscreen-map) in globals.css. */
export default async function ButikkerPage() {
  const storeData = await getStores();
  return (
    <main className="fullscreen-map bg-ink">
      {/* StoreFinder reads useSearchParams (tab/q deep links) → needs Suspense */}
      <Suspense fallback={<div className="pt-40 text-center text-fog">Loading...</div>}>
        <StoreFinder storeData={storeData} />
      </Suspense>
    </main>
  );
}
