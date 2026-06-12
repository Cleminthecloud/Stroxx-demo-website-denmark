import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { ArrowRight, Hammer, Zap, Wrench, PaintRoller, HardHat, type LucideIcon } from 'lucide-react';
import { trades } from '@/lib/trades';
import { products, toolTexture, type Product } from '@/lib/data';
import { getCompare } from '@/lib/compare';
import { SITE_URL as BASE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Fagområder: værktøj til tømrer, elektriker, VVS, maler og murer',
  description:
    'Find STROXX-værktøjet til dit fag: tømrer, elektriker, VVS, maler eller murer. Professionel kvalitet uden mærke-tillæg, 30 dages tilfredshedsgaranti, kun hos Carl Ras.',
  alternates: { canonical: '/fag' },
  openGraph: {
    title: 'STROXX fagområder: værktøj til dit fag',
    description: 'Arbejdshestene til hvert fag, til priser uden mærke-tillæg.',
  },
};

const ICONS: Record<string, LucideIcon> = {
  toemrer: Hammer,
  elektriker: Zap,
  vvs: Wrench,
  maler: PaintRoller,
  murer: HardHat,
};

/** Mini product card: image, name and price always visible (the basics work
 *  without hover, so mobile loses nothing), extra detail unfolds on hover. */
function MiniProduct({ p }: { p: Product }) {
  const cmp = getCompare(p.code);
  return (
    <Link
      href={`/produkt/${p.slug}`}
      className="group/p block rounded-lg border border-line bg-ink/60 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-stroxx-blue/50 hover:shadow-[0_0_22px_rgba(0,130,202,0.18)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={toolTexture(p.imgId)}
        alt={p.name}
        loading="lazy"
        className="mx-auto h-16 w-auto max-w-full object-contain transition-transform duration-300 group-hover/p:scale-110"
      />
      <div className="mt-2 line-clamp-1 text-[12px] leading-snug text-white/85">{p.name}</div>
      <div className="mt-0.5 text-sm font-bold text-white">
        {p.price} <span className="text-[10px] font-normal text-fog">DKK</span>
      </div>
      {/* unfolds on hover */}
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover/p:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <div className="pt-1.5 text-[11px] leading-snug text-fog">
            {cmp ? (
              <>
                A-mærke fra <span className="line-through decoration-fog/50">{cmp.ref},-</span>{' '}
                <span className="font-semibold text-stroxx-blue">spar {cmp.savePct}%</span>
              </>
            ) : (
              <>/ {p.unit} · inkl. moms</>
            )}
          </div>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-stroxx-blue">
            Se produktet <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TradesIndexPage() {
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'STROXX fagområder',
    itemListElement: trades.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      url: `${BASE}/fag/${t.slug}`,
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hjem', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Fagområder' },
    ],
  };

  return (
    <main className="bg-ink min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="mx-auto max-w-[1400px] px-5 md:px-8 pb-28 pt-32 md:pt-40">
        <Reveal>
          <div className="eyebrow mb-4">Fagområder</div>
          <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95] max-w-3xl">
            Dit fag. <span className="text-stroxx-blue">Dit værktøj.</span>
          </h1>
          <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">
            Spring kataloget over og start med det, du laver. Vi har samlet arbejdshestene
            til hvert fag, til priser uden mærke-tillæg og med 30 dages tilfredshedsgaranti.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {trades.map((t, i) => {
            const Icon = ICONS[t.slug] ?? Hammer;
            const picks = products
              .filter((p) => p.tags.some((tag) => t.categories.includes(tag)))
              .sort((a, b) => b.badges.length - a.badges.length)
              .slice(0, 3);
            return (
              <Reveal key={t.slug} delay={(i % 3) * 80}>
                <div className="glass glass-card group flex h-full flex-col rounded-xl p-7 transition-transform duration-500 hover:-translate-y-1">
                  {/* trade header → the fag page */}
                  <Link href={`/fag/${t.slug}`} className="block">
                    <span className="mb-4 grid h-12 w-12 place-items-center rounded-full border border-stroxx-blue/40 text-stroxx-blue transition-all duration-300 group-hover:border-stroxx-blue/70 group-hover:shadow-[0_0_22px_rgba(0,130,202,0.3)]">
                      <Icon size={21} strokeWidth={1.8} />
                    </span>
                    <span className="mb-2 block font-display text-2xl font-bold text-white transition-colors group-hover:text-stroxx-blue">
                      {t.name}
                    </span>
                    <p className="text-sm leading-relaxed text-fog">{t.blurb}</p>
                  </Link>

                  {/* the trade's top workhorses */}
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    {picks.map((p) => (
                      <MiniProduct key={p.slug} p={p} />
                    ))}
                  </div>

                  <Link
                    href={`/fag/${t.slug}`}
                    className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-stroxx-blue"
                  >
                    Alt til {t.name.toLowerCase()}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </main>
  );
}
