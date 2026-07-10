import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { existsSync } from 'fs';
import path from 'path';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import GlassButton from '@/components/GlassButton';
import Faq from '@/components/Faq';
import Testimonials from '@/components/Testimonials';
import { ArrowRight } from 'lucide-react';
import { products, categoryBySlug } from '@/lib/data';
import { getTestimonials, testimonialsFor, getTrades } from '@/lib/cms';
import { SITE_URL as BASE } from '@/lib/site';

export async function generateStaticParams() {
  return (await getTrades()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = (await getTrades()).find((x) => x.slug === slug);
  if (!t) return { title: 'STROXX' };
  const title = `Tools for ${t.name.toLowerCase()} without the brand markup`;
  const description = `${t.blurb} 30-day satisfaction guarantee, only at Carl Ras in Denmark.`;
  return {
    title,
    description,
    alternates: { canonical: `/fag/${t.slug}` },
    openGraph: { title: `STROXX for ${t.name.toLowerCase()}`, description },
  };
}

/** Full-bleed b/w hero image per trade, dropped in public/Images/fag/{slug}.jpg
 *  (+ optional {slug}-sm.jpg for mobile). Pages render a clean gradient hero
 *  until the file exists, so placeholders cost nothing. */
function heroSources(slug: string) {
  const dir = path.join(process.cwd(), 'public', 'Images', 'fag');
  const main = existsSync(path.join(dir, `${slug}.jpg`)) ? `/Images/fag/${slug}.jpg` : null;
  const sm = existsSync(path.join(dir, `${slug}-sm.jpg`)) ? `/Images/fag/${slug}-sm.jpg` : null;
  return { main, sm };
}

export default async function TradePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trade = (await getTrades()).find((x) => x.slug === slug);
  if (!trade) notFound();

  const cats = trade.categories.map((c) => categoryBySlug(c)).filter(Boolean);
  const picks = products
    .filter((p) => p.tags.some((t) => trade.categories.includes(t)))
    .sort((a, b) => b.badges.length - a.badges.length)
    .slice(0, 8);
  const hero = heroSources(trade.slug);
  const voices = testimonialsFor(await getTestimonials(), trade.slug).slice(0, 3);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Trades', item: `${BASE}/fag` },
      { '@type': 'ListItem', position: 3, name: trade.name },
    ],
  };
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `STROXX tools for ${trade.name.toLowerCase()}`,
    itemListElement: picks.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${BASE}/produkt/${p.slug}`,
    })),
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: trade.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main className="bg-ink min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* ── hero: full-bleed b/w trade image when present ────────────────── */}
      <section className={`relative overflow-hidden ${hero.main ? 'min-h-[78svh] flex items-end' : ''}`}>
        {hero.main && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.main}
              srcSet={hero.sm ? `${hero.sm} 1280w, ${hero.main} 2200w` : undefined}
              sizes="100vw"
              alt={`${trade.name} on the job with STROXX tools`}
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover grayscale"
            />
            <div className="pointer-events-none absolute inset-0" style={{
              background: 'linear-gradient(90deg, rgba(8,9,11,0.92) 0%, rgba(8,9,11,0.55) 40%, rgba(8,9,11,0.15) 70%)' }} />
            <div className="pointer-events-none absolute inset-0" style={{
              background: 'linear-gradient(180deg, rgba(11,12,14,0.65) 0%, rgba(11,12,14,0) 25%, rgba(11,12,14,0) 70%, #0B0C0E 100%)' }} />
          </>
        )}
        {!hero.main && (
          <div className="pointer-events-none absolute inset-0" style={{
            background: 'radial-gradient(60% 50% at 30% 40%, rgba(0,136,194,0.10), transparent 70%)' }} />
        )}
        <div className={`relative mx-auto w-full max-w-[1600px] px-6 md:px-10 ${hero.main ? 'pb-16 pt-40' : 'pt-32 md:pt-40'}`}>
          <Reveal>
            <div className="eyebrow mb-4">Trade · {trade.name}</div>
            <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95] max-w-3xl">
              {/* accent must be a real substring of the title, else render plain
                  (an editor's empty/mistyped accent must never shred the h1) */}
              {trade.accent && trade.title.includes(trade.accent) ? (
                <>
                  {trade.title.split(trade.accent)[0]}
                  <span className="text-stroxx-blue">{trade.accent}</span>
                </>
              ) : (
                trade.title
              )}
            </h1>
            <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">{trade.blurb}</p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 flex flex-wrap gap-2">
              {cats.map((c) => (
                <Link
                  key={c!.slug}
                  href={`/produkter?cat=${c!.slug}`}
                  className="rounded-full border border-line bg-ink/50 px-4 py-2 text-sm text-fog backdrop-blur-sm transition-colors hover:border-stroxx-blue/60 hover:text-white"
                >
                  {c!.name}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pb-28">
        {/* the workhorses */}
        <div className="mt-20">
          <Reveal>
            <div className="eyebrow mb-3">The workhorses</div>
            <h2 className="h-display text-white text-[clamp(1.8rem,4vw,3rem)] leading-[0.96] mb-10">
              What the crew buys again.
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
            <GlassButton href="/produkter">See the full range <ArrowRight size={15} /></GlassButton>
            <GlassButton href="/butikker" variant="ghost">Ask a specialist</GlassButton>
            <Link href="/proev-det" className="link-arrow text-sm ml-1">
              30-day satisfaction guarantee <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        </Reveal>

        {/* peer proof — hidden entirely when no testimonial is tagged with
            this trade, so a new trade never shows a heading over nothing */}
        {voices.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <div className="eyebrow mb-3">From the trade</div>
              <h2 className="h-display text-white text-[clamp(1.6rem,3.5vw,2.6rem)] leading-[0.96] mb-10">
                The crew has put it to work.
              </h2>
            </Reveal>
            <Testimonials items={voices} />
          </section>
        )}

        {/* trade FAQ */}
        <section className="mt-24 border-t border-line pt-14">
          <Reveal>
            <div className="eyebrow mb-3">Questions from the trade</div>
            <h2 className="h-display text-white text-[clamp(1.6rem,3.5vw,2.6rem)] leading-[0.96] mb-8">
              What {trade.name.toLowerCase()} ask us.
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <Faq items={trade.faq.map((f) => ({ q: f.q, a: f.a }))} />
          </Reveal>
        </section>
      </div>
    </main>
  );
}
