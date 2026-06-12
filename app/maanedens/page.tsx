import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import ScrollText from '@/components/ScrollText';
import GlassButton from '@/components/GlassButton';
import GlassLink from '@/components/GlassLink';
import ProductCard from '@/components/ProductCard';
import ParticleImage from '@/components/ParticleImage';
import CursorGlow from '@/components/CursorGlow';
import VideoProof from '@/components/VideoProof';
import Faq from '@/components/Faq';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { productBuyUrl, specialistForProduct, toolTexture, particleSrc, CR_BRAND, UTM } from '@/lib/data';
import { getCompare } from '@/lib/compare';
import { SKA } from '@/lib/ska';
import { SITE_URL } from '@/lib/site';

/* Månedens STROXX — the SKA hero landing page (docs/STROXX KOMMERCIEL MOTOR.pdf):
   one premium hero product per month gets the full story — claims, cases,
   video, comparison, FAQ, specialist — while the 5 DB2-winners and nyheder
   link straight to the webshop. Newsletter, SoMe and sales all point here. */

export const metadata: Metadata = {
  title: `Månedens værktøj: ${SKA.hero.name}`,
  description: `${SKA.month} måneds STROXX: ${SKA.hero.name} til ${SKA.hero.price} DKK, plus månedens fem DB2-vindere og nyheder. Kvalitet og værdi, ikke kun pris. 30 dages tilfredshedsgaranti hos Carl Ras.`,
  alternates: { canonical: '/maanedens' },
  openGraph: {
    title: `Månedens STROXX · ${SKA.month}: ${SKA.hero.name}`,
    description: 'Én hovedhistorie hver måned. Kvalitet og værdi, dokumenteret.',
    images: [`${SITE_URL}${toolTexture(SKA.hero.imgId, '50383')}`],
  },
};

export default function MaanedensPage() {
  const hero = SKA.hero;
  const buyUrl = productBuyUrl(hero.code);
  const cmp = getCompare(hero.code);
  const spec = specialistForProduct(hero);

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
      { '@type': 'ListItem', position: 1, name: 'Hjem', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Månedens værktøj' },
    ],
  };

  return (
    <main className="bg-ink min-h-screen overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── HERO — månedens hovedhistorie ─────────────────────────────── */}
      <section className="relative">
        <CursorGlow size="44% 60%" intensity={0.15} className="-z-0" />
        <div className="relative mx-auto max-w-[1500px] px-5 md:px-10 pt-32 md:pt-40 pb-10 grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <Reveal from="left">
            <div className="eyebrow mb-4">Månedens STROXX · {SKA.month} {SKA.year}</div>
            <h1 className="h-display text-white text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.94]">
              {hero.name.replace(' Green', '')}
              <span className="text-stroxx-blue"> Green.</span>
              <br />
              <span className="text-fog">Én historie. Hver måned.</span>
            </h1>
            <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">
              Hver måned vælger vi ét stykke værktøj, der fortjener hele historien.
              I {SKA.month.toLowerCase()} er det den grønne 3D-streglaser: tre selvnivellerende
              360-graders planer, synlige hele arbejdsdagen.
            </p>
            <div className="mt-7 flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <span className="h-display text-white text-4xl">{hero.price}</span>
              <span className="text-fog text-sm">DKK inkl. moms / {hero.unit}</span>
              {cmp && (
                <span className="text-fog text-sm">
                  Tilsvarende A-mærke fra <span className="line-through decoration-fog/50">{cmp.ref},-</span>{' '}
                  <span className="text-stroxx-blue font-semibold">spar {cmp.savePct}%</span>
                </span>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <GlassButton href={buyUrl} external>Køb hos Carl Ras <ArrowRight size={16} /></GlassButton>
              <GlassButton href="#historien" variant="ghost">Hvorfor den vinder</GlassButton>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-fog">
              <span className="h-2 w-2 rounded-full bg-green-500" /> 30 dages tilfredshedsgaranti · købet sker hos Carl Ras
            </div>
          </Reveal>
          <Reveal from="far-right" className="relative aspect-[5/4]">
            <ParticleImage src={particleSrc('lasere', hero.imgId)} className="h-full w-full" />
          </Reveal>
        </div>
      </section>

      {/* ── CLAIMS — kvalitet og værdi, ikke pris ─────────────────────── */}
      <section id="historien" className="relative scroll-mt-24">
        <div className="mx-auto max-w-[1500px] px-5 md:px-10 py-24 md:py-32">
          <Reveal><div className="eyebrow mb-5">Historien</div></Reveal>
          <ScrollText as="h2" text={'Kvalitet og værdi. \n Ikke kun pris.'}
            className="h-display text-white text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.92] mb-14" />
          <div className="grid gap-5 md:grid-cols-3">
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

      {/* ── CASES — hvor den tjener sig hjem ──────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 50% at 50% 45%, rgba(0,130,202,0.08), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1500px] px-5 md:px-10 py-24 md:py-32 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <Reveal><div className="eyebrow mb-5">Anvendelse</div></Reveal>
            <ScrollText as="h2" text={'Én mand. \n Hele opmålingen.'}
              className="h-display text-white text-[clamp(2.2rem,5vw,4rem)] leading-[0.92] mb-8" />
            <ScrollText as="p" className="text-fog text-lg leading-relaxed max-w-md"
              text="Det dyreste på pladsen er tid. En 3D-laser sætter alle linjer på én gang, så opmålingen ikke kræver to mand og en snor." />
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
        <div className="mx-auto max-w-[1500px] px-5 md:px-10 py-24 md:py-28">
          <Reveal><div className="eyebrow mb-5">Demonstration</div></Reveal>
          <ScrollText as="h2" text="Se det. Døm det selv."
            className="h-display text-white text-[clamp(2rem,4.5vw,3.4rem)] leading-[0.95] mb-12" />
          <VideoProof />
        </div>
      </section>

      {/* ── SPECIALIST — troværdighed med direkte nummer ──────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-[1500px] px-5 md:px-10 py-24 md:py-32 text-center">
          <Reveal><div className="eyebrow mb-8">Anbefalet af specialisterne</div></Reveal>
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
                <GlassLink href={`tel:+45${spec.phone}`} label="Ring"><Phone size={15} strokeWidth={2} className="relative" /></GlassLink>
                <GlassLink href={`mailto:${spec.email}`} label="Email"><Mail size={15} strokeWidth={2} className="relative" /></GlassLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-[900px] px-5 md:px-10 py-20 md:py-24">
          <Reveal><div className="eyebrow mb-5">Spørgsmål</div></Reveal>
          <ScrollText as="h2" text="Det, kollegerne spørger om."
            className="h-display text-white text-[clamp(1.8rem,4vw,2.8rem)] leading-[0.95] mb-8" />
          <Faq items={SKA.heroFaq} />
        </div>
      </section>

      {/* ── MÅNEDENS LINEUP — DB2-vindere + nyheder ───────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-[1500px] px-5 md:px-10 py-24 md:py-32">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-5">Resten af måneden</div>
              <h2 className="h-display text-white text-[clamp(2rem,4.5vw,3.4rem)] leading-[0.95]">
                Fem vindere. To nyheder.
              </h2>
            </div>
            <Link href="/produkter" className="link-arrow hidden sm:inline-flex shrink-0">
              Se hele sortimentet <ArrowRight size={15} />
            </Link>
          </Reveal>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-14">
            {SKA.cashCows.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 5) * 60}><ProductCard product={p} /></Reveal>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {SKA.nyheder.map((n, i) => (
              <Reveal key={n.product.slug} delay={i * 90}>
                <Link href={`/produkt/${n.product.slug}`}
                  className="glass-panel glass-panel--frost glass-panel--glow rounded-2xl p-7 flex gap-6 items-center group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={toolTexture(n.product.imgId)} alt={n.product.name} loading="lazy" decoding="async"
                    className="h-28 w-28 object-contain shrink-0 transition-transform duration-500 group-hover:scale-110" />
                  <div className="min-w-0">
                    <div className="text-stroxx-blue text-[11px] uppercase tracking-wider mb-1.5">{n.type}</div>
                    <div className="text-white text-lg font-medium leading-snug mb-1.5">{n.product.name}</div>
                    <p className="text-fog text-sm leading-relaxed mb-2">{n.pitch}</p>
                    <span className="h-display text-white text-xl">{n.product.price}<span className="text-fog text-xs ml-1.5">DKK / {n.product.unit}</span></span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-36 text-center px-6">
        <Reveal>
          <h2 className="h-display text-white text-[clamp(2.6rem,8vw,7rem)] leading-[0.9] mb-10">
            Prøv den. <span className="text-stroxx-blue">I 30 dage.</span>
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <div className="flex flex-wrap justify-center gap-3">
            <GlassButton href={buyUrl} external>Køb {hero.name} <ArrowRight size={16} /></GlassButton>
            <GlassButton href={`${CR_BRAND}/?${UTM}`} external variant="ghost">Hele STROXX hos Carl Ras</GlassButton>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
