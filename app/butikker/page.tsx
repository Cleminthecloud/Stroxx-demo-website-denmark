import type { Metadata } from 'next';
import StoreFinder from '@/components/StoreFinder';

export const metadata: Metadata = {
  title: 'Find butik — STROXX',
  description:
    'Find din nærmeste STROXX-forhandler. 26 butikker i hele Danmark med adresser, åbningstider og direkte kontakt til butikschefen.',
};

/** Full-screen, app-like finder: the map IS the page. The global footer is
 *  hidden on this route via body:has(main.fullscreen-map) in globals.css. */
export default function ButikkerPage() {
  return (
    <main className="fullscreen-map bg-ink">
      <StoreFinder />
    </main>
  );
}
