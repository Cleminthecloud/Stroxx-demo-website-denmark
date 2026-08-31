import Link from 'next/link';
import Reveal from '@/components/Reveal';
import ScrollText from '@/components/ScrollText';
import GlassButton from '@/components/GlassButton';
import GlassLink from '@/components/GlassLink';
import ProductCard from '@/components/ProductCard';
import ParticleImage from '@/components/ParticleImage';
import CursorGlow from '@/components/CursorGlow';
import VideoProof from '@/components/VideoProof';
import HotspotImage from '@/components/HotspotImage';
import Faq from '@/components/Faq';
import Accent from '@/components/Accent';
import { ArrowRight, ArrowLeft, Phone, Mail, Archive } from 'lucide-react';
import { toolTexture, particleSrc } from '@/lib/data';
import BuyCTA from '@/components/BuyCTA';
import { getSpecialists, getVideos, pickSpecialist, getMarkets, type SkaData } from '@/lib/cms';
import { getLocale } from '@/lib/locale';
import { cardCols, productColsWide } from '@/lib/grid';
import { SITE_URL } from '@/lib/site';

/** Månedens STROXX — one month's full page.
 *
 *  Shared by the live month at /monthly and by every archived month at
 *  /monthly/YYYY-MM, so a month that has been shared, printed on a QR code or
 *  linked from a newsletter keeps working forever and looks exactly as it did.
 *  `archived` only adds the banner and switches the breadcrumb: the content
 *  itself is whatever that month's lineup document says. */
export default async function MonthlyLineupView({
  SKA,
  archived = false,
}: {
  SKA: SkaData;
  archived?: boolean;
}) {
  const hero = SKA.hero;
  const spec = pickSpecialist(await getSpecialists(), hero);
  /* market-first guarantee chip: name the current market's dealer, never a
     hardcoded one; international stays generic */
  const locale = await getLocale();
  const dealer = (await getMarkets()).find((m) => m.code === locale.market && m.dealerName) ?? null;
  const films = SKA.films.length ? SKA.films : await getVideos();

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SKA.heroFaq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      ...(archived
        ? [
            { '@type': 'ListItem', position: 2, name: 'Tool of the Month', item: `${SITE_URL}/monthly` },
            { '@type': 'ListItem', position: 3, name: 'Archive', item: `${SITE_URL}/monthly/archive` },
            { '@type': 'ListItem', position: 4, name: `${SKA.month} ${SKA.year}` },
          ]
        : [{ '@type': 'ListItem', position: 2, name: 'Tool of the Month' }]),
    ],
  };

  return (
    <main className="bg-ink min-h-screen overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── ARCHIVED NOTICE — an old month must say so on sight ───────── */}
      {archived && (
        <div className="relative z-[45] border-b border-white/10 bg-white/[0.04]">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 md:px-10">
            <span className="inline-flex items-center gap-2 text-sm text-white">
              <Archive size={15} className="text-stroxx-blue" />
              From the archive: {SKA.month} {SKA.year}
            </span>
            <span className="text-sm text-fog">Some products may no longer be in the range.</span>
            <span className="ml-auto flex flex-wrap gap-4">
              <Link href="/monthly" className="link-arrow">This month <ArrowRight size={14} /></Link>
              <Link href="/monthly/archive" className="link-arrow">All months <ArrowRight size={14} /></Link>
            </span>
          </div>
        </div>
      )}

      {/* ── HERO — månedens hovedhistorie ─────────────────────────────── */}
      <section className="relative">
        <CursorGlow size="44% 60%" intensity={0.15} className="-z-0" />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 pt-32 md:pt-40 pb-10 grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <Reveal from="left">
            <div className="eyebrow mb-4">STROXX of the Month · {SKA.month} {SKA.year}</div>
            <h1 className="h-display text-white text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.94]">
              Check out our <span className="text-stroxx-blue">product of the month.</span>
            </h1>
            <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">
              Every month we pick one tool that deserves the full story.{' '}
              {/* the month's own one-liner when the editor wrote one, so an
                  archived month never describes the wrong tool */}
              {SKA.summary ? <Accent text={SKA.summary} /> : `In ${SKA.month.toLowerCase()} it is the ${hero.name}.`}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BuyCTA code={hero.code} arrow />
              <GlassButton href="#historien" variant="ghost">Why it wins</GlassButton>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-fog">
              <span className="h-2 w-2 rounded-full bg-green-500" /> 30-day satisfaction guarantee · purchase made at {dealer?.dealerName || 'your STROXX dealer'}
            </div>
          </Reveal>
          <Reveal from="far-right" className="relative aspect-[5/4]">
            {/* the hero's OWN category, not a hardcoded one: the monthly hero
                changes category every month, and a fixed slug here would keep
                serving last month's particle source */}
            <ParticleImage src={particleSrc(hero.category, hero.imgId)} className="h-full w-full" />
          </Reveal>
        </div>
      </section>

      {/* ── CLAIMS — kvalitet og værdi, ikke pris ─────────────────────── */}
      <section id="historien" className="relative scroll-mt-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
          <Reveal><div className="eyebrow mb-5">The story</div></Reveal>
          <ScrollText as="h2" text={'Quality and value. \n Not just price.'}
            className="h-display text-white text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.92] mb-14" />
          <div className={`grid gap-5 ${cardCols(SKA.heroClaims.length)}`}>
            {SKA.heroClaims.map((c, i) => (
              <Reveal key={c.title} delay={i * 90} from="left">
                <div className="glass-card glass-panel glass-panel--frost rounded-2xl p-7 h-full">
                  <div className="text-stroxx-blue text-xs uppercase tracking-wider mb-3">{String(i + 1).padStart(2, '0')}</div>
                  <div className="text-white text-xl font-medium mb-2.5">{c.title}</div>
                  <p className="text-fog text-sm leading-relaxed">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOTSPOTS — the tool itself, point by point (optional) ─────── */}
      {SKA.hotspot && (
        <section className="relative">
          <div className="mx-auto max-w-[1600px] px-6 md:px-10 pb-8 md:pb-16">
            <div className="max-w-3xl mb-10">
              <Reveal><div className="eyebrow mb-5">{SKA.hotspot.eyebrow || 'Up close'}</div></Reveal>
              {SKA.hotspot.headline && (
                <ScrollText as="h2" text={SKA.hotspot.headline}
                  className="h-display text-white text-[clamp(2rem,4.5vw,3.4rem)] leading-[0.95]" />
              )}
              {SKA.hotspot.sub && (
                <Reveal delay={100}><p className="mt-5 text-fog text-lg leading-relaxed max-w-xl"><Accent text={SKA.hotspot.sub} /></p></Reveal>
              )}
            </div>
            <Reveal delay={80}>
              <HotspotImage src={SKA.hotspot.src} alt={SKA.hotspot.alt || hero.name} spots={SKA.hotspot.spots} fit={SKA.hotspot.fit} />
            </Reveal>
            <ol className="sr-only">
              {SKA.hotspot.spots.map((sp, i) => (
                <li key={sp._key ?? i}>{[sp.title, sp.body, sp.productName].filter(Boolean).join('. ')}</li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── CASES — hvor den tjener sig hjem ──────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 50% at 50% 45%, rgba(0,136,194,0.08), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <Reveal><div className="eyebrow mb-5">Application</div></Reveal>
            <ScrollText as="h2" text={'One person easily \n gets the job *done.*'}
              className="h-display text-white text-[clamp(2.2rem,5vw,4rem)] leading-[0.92] mb-8" />
            <ScrollText as="p" className="text-fog text-lg leading-relaxed max-w-md"
              text="The most expensive thing on site is time. A 3D laser sets every line at once, so marking out doesn't take two people and a string." />
          </div>
          <div className="grid gap-5">
            {SKA.heroCases.map((c, i) => (
              <Reveal key={c.trade} delay={i * 90} from="right">
                <div className="glass-panel glass-panel--frost rounded-2xl p-6 flex gap-5 items-start">
                  <div className="h-display text-stroxx-blue text-2xl shrink-0 w-28">{c.trade}</div>
                  <p className="text-fog text-sm leading-relaxed">{c.use}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO — se det i aktion ───────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-28">
          <Reveal><div className="eyebrow mb-5">Demonstration</div></Reveal>
          <ScrollText as="h2" text="See it. Judge it yourself."
            className="h-display text-white text-[clamp(2rem,4.5vw,3.4rem)] leading-[0.95] mb-12" />
          <VideoProof videos={films} />
        </div>
      </section>

      {/* ── SPECIALIST — troværdighed med direkte nummer ──────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32 text-center">
          <Reveal><div className="eyebrow mb-8">Recommended by the specialists</div></Reveal>
          <Reveal delay={80}>
            <blockquote className="h-display text-white text-[clamp(1.7rem,3.6vw,2.8rem)] leading-[1.1] mb-10 max-w-3xl mx-auto">
              “{spec.quote}”
            </blockquote>
          </Reveal>
          <Reveal delay={160}>
            <div className="flex items-center justify-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={spec.photo} alt={spec.name} className="h-12 w-12 rounded-full object-cover grayscale" />
              <div className="text-left">
                <div className="text-white text-sm">{spec.name}</div>
                <div className="text-fog text-xs">{spec.role} · {spec.location}</div>
              </div>
              <div className="flex gap-2 ml-2">
                <GlassLink href={`tel:+45${spec.phone}`} label="Call"><Phone size={15} strokeWidth={2} className="relative" /></GlassLink>
                <GlassLink href={`mailto:${spec.email}`} label="Email"><Mail size={15} strokeWidth={2} className="relative" /></GlassLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-[900px] px-6 md:px-10 py-20 md:py-24">
          <Reveal><div className="eyebrow mb-5">Questions</div></Reveal>
          <ScrollText as="h2" text="What the trade asks about."
            className="h-display text-white text-[clamp(1.8rem,4vw,2.8rem)] leading-[0.95] mb-8" />
          <Faq items={SKA.heroFaq} />
        </div>
      </section>

      {/* ── MÅNEDENS LINEUP — DB2-vindere + nyheder ───────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-5">The rest of the month</div>
              <h2 className="h-display text-white text-[clamp(2rem,4.5vw,3.4rem)] leading-[0.95]">
                Five winners. Two new arrivals.
              </h2>
            </div>
            <Link href="/products" className="link-arrow hidden sm:inline-flex shrink-0">
              See the full range <ArrowRight size={15} />
            </Link>
          </Reveal>

          <div className={`grid gap-4 grid-cols-2 ${productColsWide(SKA.cashCows.length)} mb-14`}>
            {SKA.cashCows.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 5) * 60}><ProductCard product={p} /></Reveal>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {SKA.nyheder.map((n, i) => (
              <Reveal key={n.product.slug} delay={i * 90}>
                <Link href={`/product/${n.product.slug}`}
                  className="glass-panel glass-panel--frost glass-panel--glow rounded-2xl p-7 flex gap-6 items-center group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={toolTexture(n.product.imgId)} alt={n.product.name} loading="lazy" decoding="async"
                    className="h-28 w-28 object-contain shrink-0 transition-transform duration-500 group-hover:scale-110" />
                  <div className="min-w-0">
                    <div className="text-stroxx-blue text-[11px] uppercase tracking-wider mb-1.5">{n.type}</div>
                    <div className="text-white text-lg font-medium leading-snug mb-1.5">{n.product.name}</div>
                    <p className="text-fog text-sm leading-relaxed">{n.pitch}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* the way back into the archive, from every month */}
          <Reveal delay={120}>
            <div className="mt-16 flex flex-wrap items-center gap-6 border-t border-white/10 pt-8">
              <Link href="/monthly/archive" className="link-arrow">
                <ArrowLeft size={15} /> Every month we have published
              </Link>
              {archived && <Link href="/monthly" className="link-arrow">See this month <ArrowRight size={15} /></Link>}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-36 text-center px-6">
        <Reveal>
          <h2 className="h-display text-white text-[clamp(2.6rem,8vw,7rem)] leading-[0.9] mb-10">
            Try it. <span className="text-stroxx-blue">For 30 days.</span>
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="flex flex-wrap justify-center gap-3">
            <BuyCTA code={hero.code} label={`Buy the ${hero.name}`} arrow />
            <BuyCTA variant="ghost" />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
