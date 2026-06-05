import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { ArrowRight } from 'lucide-react';
import { trades } from '@/lib/trades';

export const metadata: Metadata = {
  title: 'Fagområder',
  description:
    'Find STROXX-værktøjet til dit fag: tømrer, elektriker, VVS, maler eller murer. Professionel kvalitet uden mærke-tillæg, med 30 dages tilfredshedsgaranti.',
};

export default function TradesIndexPage() {
  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8 pb-28 pt-32 md:pt-40">
        <Reveal>
          <div className="eyebrow mb-4">Fagområder</div>
          <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95] max-w-3xl">
            Dit fag. Dit værktøj.
          </h1>
          <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">
            Spring kataloget over og start med det, du laver. Vi har samlet arbejdshestene
            til hvert fag, til priser uden mærke-tillæg.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trades.map((t, i) => (
            <Reveal key={t.slug} delay={(i % 3) * 80}>
              <Link href={`/fag/${t.slug}`} className="group block glass glass-card rounded-xl p-7 h-full transition-transform duration-500 hover:-translate-y-1">
                <div className="text-[11px] uppercase tracking-wider text-fog mb-2">STROXX til</div>
                <div className="text-white font-display font-bold text-2xl mb-2 group-hover:text-stroxx-blue transition-colors">
                  {t.name}
                </div>
                <p className="text-fog text-sm leading-relaxed mb-5">{t.blurb}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-stroxx-blue">
                  Se værktøjet <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
