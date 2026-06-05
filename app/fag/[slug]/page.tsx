import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import GlassButton from '@/components/GlassButton';
import { ArrowRight } from 'lucide-react';
import { products, categoryBySlug } from '@/lib/data';
import { trades, tradeBySlug } from '@/lib/trades';

export function generateStaticParams() {
  return trades.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = tradeBySlug(params.slug);
  if (!t) return { title: 'STROXX' };
  return {
    title: `${t.name} — værktøj uden mærke-tillæg`,
    description: `${t.blurb} 30 dages tilfredshedsgaranti, kun hos Carl Ras.`,
  };
}

export default function TradePage({ params }: { params: { slug: string } }) {
  const trade = tradeBySlug(params.slug);
  if (!trade) notFound();

  const cats = trade.categories.map((c) => categoryBySlug(c)).filter(Boolean);
  // workhorses for this trade: most-badged products across the mapped categories
  const picks = products
    .filter((p) => p.tags.some((t) => trade.categories.includes(t)))
    .sort((a, b) => b.badges.length - a.badges.length)
    .slice(0, 8);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hjem', item: 'https://stroxx-demo-website-denmark.vercel.app/' },
      { '@type': 'ListItem', position: 2, name: 'Fagområder', item: 'https://stroxx-demo-website-denmark.vercel.app/fag' },
      { '@type': 'ListItem', position: 3, name: trade.name },
    ],
  };

  return (
    <main className="bg-ink min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="mx-auto max-w-[1400px] px-5 md:px-8 pb-28 pt-32 md:pt-40">
        <Reveal>
          <div className="eyebrow mb-4">Fagområde · {trade.name}</div>
          <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95] max-w-3xl">
            {trade.title}
          </h1>
          <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">{trade.blurb}</p>
        </Reveal>

        {/* category chips */}
        <Reveal delay={100}>
          <div className="mt-10 flex flex-wrap gap-2">
            {cats.map((c) => (
              <Link
                key={c!.slug}
                href={`/produkter?cat=${c!.slug}`}
                className="text-sm px-4 py-2 rounded-full border border-line text-fog transition-colors hover:text-white hover:border-stroxx-blue/60"
              >
                {c!.name}
              </Link>
            ))}
          </div>
        </Reveal>

        {/* the workhorses */}
        <div className="mt-20">
          <Reveal>
            <div className="eyebrow mb-3">Arbejdshestene</div>
            <h2 className="h-display text-white text-[clamp(1.8rem,4vw,3rem)] leading-[0.96] mb-10">
              Det, kollegerne køber igen.
            </h2>
          </Reveal>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {picks.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 4) * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* next step */}
        <Reveal delay={120}>
          <div className="mt-16 flex flex-wrap items-center gap-3">
            <GlassButton href="/produkter">Se hele sortimentet <ArrowRight size={15} /></GlassButton>
            <GlassButton href="/butikker?tab=specialister" variant="ghost">Spørg en specialist</GlassButton>
            <Link href="/proev-det" className="link-arrow text-sm ml-1">
              30 dages tilfredshedsgaranti <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
