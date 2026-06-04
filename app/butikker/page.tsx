import type { Metadata } from 'next';
import StoreFinder from '@/components/StoreFinder';
import Reveal from '@/components/Reveal';
import { stores } from '@/lib/stores';

export const metadata: Metadata = {
  title: 'Find butik — STROXX',
  description:
    'Find din nærmeste STROXX-forhandler. 26 butikker i hele Danmark med adresser, åbningstider og direkte kontakt til butikschefen.',
};

export default function ButikkerPage() {
  const n = stores.length;
  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-32 md:pt-40 pb-20 md:pb-28">
        <div className="max-w-3xl mb-10 md:mb-14">
          <Reveal>
            <div className="eyebrow mb-5">Butikker · Danmark</div>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="h-display text-white text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.94] mb-5">
              Tag værktøjet i hånden, før du køber det.
            </h1>
          </Reveal>
          <Reveal delay={130}>
            <p className="text-fog text-base md:text-lg leading-relaxed max-w-xl">
              STROXX sælges i {n} butikker over hele landet. Søg, filtrér eller
              find den nærmeste, og ring direkte til butikschefen hvis du vil
              have fingrene i et bestemt stykke værktøj.
            </p>
          </Reveal>
        </div>

        <Reveal delay={180}>
          <StoreFinder />
        </Reveal>
      </div>
    </main>
  );
}
