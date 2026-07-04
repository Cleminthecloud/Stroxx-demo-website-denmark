import { getSiteSettings, getTrades } from '@/lib/cms';
import Accent from '@/components/Accent';
import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { ArrowRight, Hammer, Zap, Wrench, PaintRoller, HardHat, type LucideIcon } from 'lucide-react';
import { products, toolTexture, type Product } from '@/lib/data';
import { SITE_URL as BASE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Trades: tools for carpenters, electricians, plumbers, painters and masons',
  description:
    'Find the STROXX tool for your trade: carpenter, electrician, plumbing, painter or mason. Professional quality without the brand markup, 30-day satisfaction guarantee, only at Carl Ras.',
  alternates: { canonical: '/fag' },
  openGraph: {
    title: 'STROXX trades: tools for your trade',
    description: 'The workhorses for every trade, without the brand markup.',
  },
};

const ICONS: Record<string, LucideIcon> = {
  toemrer: Hammer,
  elektriker: Zap,
  vvs: Wrench,
  maler: PaintRoller,
  murer: HardHat,
};

/** Mini product card: image and name always visible (the basics work without
 *  hover, so mobile loses nothing), extra detail unfolds on hover. */
function MiniProduct({ p }: { p: Product }) {
  return (
    <Link
      href={`/produkt/${p.slug}`}
      className="group/p block rounded-lg border border-line bg-ink/60 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-stroxx-blue/50 hover:shadow-[0_0_22px_rgba(0,136,194,0.18)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={toolTexture(p.imgId)}
        alt={p.name}
        loading="lazy"
        className="mx-auto h-16 w-auto max-w-full object-contain transition-transform duration-300 group-hover/p:scale-110"
      />
      <div className="mt-2 line-clamp-1 text-[12px] leading-snug text-white/85">{p.name}</div>
      {/* unfolds on hover */}
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover/p:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-stroxx-blue">
            View product <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function TradesIndexPage() {
  const [cms, trades] = await Promise.all([getSiteSettings(), getTrades()]);
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'STROXX trades',
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Trades' },
    ],
  };

  return (
    <main className="bg-ink min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pb-28 pt-32 md:pt-40">
        <Reveal>
          <div className="eyebrow mb-4">Trades</div>
          <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95] max-w-3xl">
            <Accent text={cms?.fagHeadline || 'Your trade. *Your tools.*'} />
          </h1>
          <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">
            {cms?.fagIntro || "Skip the catalog and start with what you do. We've pulled together the workhorses for every trade, without the brand markup and backed by a 30-day satisfaction guarantee."}
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
                  {/* trade header to the fag page */}
                  <Link href={`/fag/${t.slug}`} className="block">
                    <span className="mb-4 grid h-12 w-12 place-items-center rounded-full border border-stroxx-blue/40 text-stroxx-blue transition-all duration-300 group-hover:border-stroxx-blue/70 group-hover:shadow-[0_0_22px_rgba(0,136,194,0.3)]">
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
                    Everything for {t.name.toLowerCase()}
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
