import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import ScrollText from '@/components/ScrollText';
import GlassButton from '@/components/GlassButton';
import BuyCTA from '@/components/BuyCTA';
import ProductCard from '@/components/ProductCard';
import GuaranteeModal from '@/components/GuaranteeModal';
import VideoProof from '@/components/VideoProof';
import CountUp from '@/components/CountUp';
import Faq from '@/components/Faq';
import Testimonials from '@/components/Testimonials';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { products, CR_BRAND, UTM } from '@/lib/data';
import { getTestimonials, getLandingPage } from '@/lib/cms';

/* FAQ: grounded in the real guarantee terms (public/STROXX-tilfredshedsgaranti.pdf).
   Rendered as an accordion AND as FAQPage JSON-LD so answer engines can quote it. */
const FAQ_ITEMS = [
  {
    q: 'How does the STROXX satisfaction guarantee work?',
    a: 'You try the tool on real work for 30 days. If you\'re not happy, you get your money back. No need for faults or defects, your judgment is enough. The guarantee applies to business customers with an account at Carl Ras.',
  },
  {
    q: 'What does the guarantee cover, and what does it not?',
    a: 'It covers all STROXX products except access control. For bulk purchases, the guarantee applies to the first item bought. Returns are handled at your Carl Ras store with an invoice or delivery note, and for online orders via customer service on 44 85 55 11.',
  },
  {
    q: 'Where can I buy STROXX?',
    a: 'In Denmark, STROXX is available exclusively at Carl Ras, in 26 stores across the country and online at carl-ras.dk. Across the rest of Europe, the brand is sold through chains like Meesenburg in Germany, Foussier in France and Lecot in Belgium.',
  },
  {
    q: 'How can STROXX be so affordable?',
    a: 'STROXX is developed by trade pros in Denmark, Germany, France and Belgium, who set the specifications and choose the materials themselves. There are no logo premiums, sponsorships or costly middlemen. You pay for the tool, not for the advertising.',
  },
  {
    q: 'Is STROXX professional quality?',
    a: 'Yes. STROXX is built for professional use and spans over 1,400 item numbers, sold in more than 227 stores across Europe. Tolerances, materials and durability measure quality, not the price tag. That\'s why we back it with a 30-day satisfaction guarantee.',
  },
];

export const metadata: Metadata = {
  title: 'Afford more than just tools',
  description:
    'You pay for the logo, not the steel. STROXX is professional quality without the brand markup, backed by a 100% satisfaction guarantee. Try it for 30 days.',
  alternates: { canonical: '/proev-det' },
};

/* Landing structure follows the conversion narrative:
   1 hero hook → 2 name the frustration → 3 the habit (why the brain picks the
   expensive brand) → 4 the reframe (how it's possible) → 5 proof (products)
   → 6 what changes (payoff image) → 7 risk reversal + clear next step.
   One full-bleed photo only; the rest carries the argument. */

// the proof: four workhorses
const PROOF_CODES = ['34011573', '34009021', '35011812', '35011846'];

const STEPS = [
  {
    n: '01',
    t: 'Find your store',
    d: '26 stores across the country, or buy online at Carl Ras. Get the tool in your hand first, if you like.',
  },
  {
    n: '02',
    t: 'Use it on real work',
    d: 'Not five minutes in the driveway. 30 days on site, where it counts.',
  },
  {
    n: '03',
    t: 'Happy? Or your money back',
    d: 'If you\'re not satisfied, you get your money back. No need for faults, your judgment is enough.',
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow mb-6">{children}</div>;
}

export default async function ProevDetPage() {
  const proof = PROOF_CODES.map((c) => products.find((p) => p.code === c)).filter(Boolean);
  const buy = `${CR_BRAND}/?${UTM}`;

  /* This campaign now lives in the CMS as a landingPage (slug "proev-det").
     When that document exists, this historic URL permanently redirects to the
     canonical /kampagne/proev-det. The hand-built page below only renders as a
     safety fallback if that document is ever removed. */
  const doc = await getLandingPage('proev-det');
  if (doc?.sections?.length) permanentRedirect('/kampagne/proev-det');
  const testimonials = await getTestimonials();

  /* Structured data: FAQ + the trial steps as HowTo, so answer engines can
     quote the guarantee mechanics directly (fallback copy). */
  const faqSrc = FAQ_ITEMS;
  const stepsSrc = STEPS;

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqSrc.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const howToLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to try STROXX for 30 days with the satisfaction guarantee',
    description:
      'STROXX gives you a 30-day satisfaction guarantee: try the tool on real work, and get your money back if you\'re not happy.',
    step: stepsSrc.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.t,
      text: s.d,
    })),
  };

  return (
    <main className="bg-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />
      {/* ── 1 · HERO — the hook ────────────────────────────────────────── */}
      <section className="relative h-[100svh] min-h-[560px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Images/campaign/rings.jpg" srcSet="/Images/campaign/rings-sm.jpg 1280w, /Images/campaign/rings.jpg 2200w"
          sizes="100vw" alt="Tradesperson with rings and a hammer" draggable={false}
          className="absolute inset-0 h-full w-full object-cover grayscale select-none" style={{ objectPosition: '62% 35%' }} />
        <div className="pointer-events-none absolute inset-0 hidden lg:block" style={{
          background: 'linear-gradient(90deg, rgba(8,9,11,0.93) 0%, rgba(8,9,11,0.66) 34%, rgba(8,9,11,0.18) 62%, rgba(8,9,11,0) 82%)' }} />
        <div className="pointer-events-none absolute inset-0 lg:hidden" style={{
          background: 'linear-gradient(180deg, rgba(8,9,11,0.35) 0%, rgba(8,9,11,0) 30%, rgba(8,9,11,0.5) 55%, rgba(8,9,11,0.97) 100%)' }} />
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(11,12,14,0.6) 0%, rgba(11,12,14,0) 18%, rgba(11,12,14,0) 80%, #0B0C0E 100%)' }} />

        <div className="relative h-full mx-auto max-w-[1600px] px-6 md:px-10 flex items-end pb-14 lg:items-center lg:pb-0">
          <div className="max-w-2xl">
            <Eyebrow>Campaign · Try It</Eyebrow>
            <h1 className="h-display text-white text-[clamp(2.6rem,7vw,6rem)] leading-[0.92] mb-6">
              Pro-grade tools.<br />Without the <span className="text-stroxx-blue">brand</span> tax.
            </h1>
            <p className="text-fog text-base md:text-xl leading-relaxed mb-8 max-w-lg">
              Professional tools without the logo markup. And yes, it sounds too good
              to be true. That's why you get <span className="text-stroxx-blue font-semibold">30 days</span> to prove us wrong.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <BuyCTA label="Buy at Carl Ras" intlLabel="Where to buy" arrow />
              <a href="#fornemmelsen" className="link-arrow text-sm">Why so affordable? <ArrowDown size={15} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · THE FRUSTRATION — name what they feel ──────────────────── */}
      <section id="fornemmelsen" className="relative scroll-mt-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-28 md:py-40">
          <div className="max-w-4xl">
            <Reveal><Eyebrow>The feeling</Eyebrow></Reveal>
            <ScrollText as="h2" text={'You\'re not paying for the tool. \n You\'re paying for *the name.*'}
              className="h-display text-white text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.96] mb-10" />
            <Reveal delay={120}>
              <p className="text-fog text-lg md:text-xl leading-relaxed max-w-2xl">
                A new machine, a set of bits, a knife. You put it on the counter
                and pay a price you've learned to accept. But somewhere in the
                back of your mind, you know it: part of that amount doesn't go to
                the steel in your hand. It goes to the advertising, the
                sponsorships and the logo on the side.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 3 · THE HABIT — why the brain picks the expensive brand ───── */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 30% 50%, rgba(0,136,194,0.07), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36">
          <div className="max-w-4xl lg:ml-auto lg:text-right">
            <Reveal><Eyebrow>The habit</Eyebrow></Reveal>
            <ScrollText as="h2" text={'Expensive feels safe. \n That\'s the whole *trick.*'}
              className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96] mb-10" />
            <Reveal delay={100}>
              <p className="text-fog text-lg md:text-xl leading-relaxed max-w-2xl lg:ml-auto mb-6">
                When you're holding two tools, the brain picks the expensive one.
                Not because you've tested it, but because the price feels like a
                guarantee. And because nobody looks foolish for buying the
                well-known brand.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="text-white text-lg md:text-xl leading-relaxed max-w-2xl lg:ml-auto">
                But price doesn't measure quality. Tolerances, materials and
                durability do. And those aren't printed on the price tag.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 4 · THE REFRAME — how it's possible ────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 50%, rgba(0,136,194,0.10), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36 grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal><Eyebrow>How it's possible</Eyebrow></Reveal>
            <ScrollText as="h2" text={'*Same* steel. \n Without the brand tax.'}
              className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96] mb-8" />
            <Reveal delay={100}>
              <p className="text-fog text-lg leading-relaxed max-w-xl mb-6">
                STROXX is developed in close collaboration between trade pros in
                Denmark, Germany, France and Belgium. We set the specifications
                ourselves, choose the materials ourselves and cut every
                unnecessary step, logo premium and costly markup.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="text-white text-lg leading-relaxed max-w-xl">
                What you pay for is the tool. Not the advertising for it.
              </p>
            </Reveal>
          </div>
          <Reveal delay={140} from="right">
            <div className="grid grid-cols-3 gap-6 lg:gap-8">
              {[
                { v: 4, suf: '', l: 'countries behind it' },
                { v: 227, suf: '+', l: 'stores in Europe' },
                { v: 1400, suf: '+', l: 'item numbers' },
              ].map((s) => (
                <div key={s.l} className="text-center lg:text-left">
                  <CountUp value={s.v} suffix={s.suf}
                    className="h-display text-white text-[clamp(2rem,4.5vw,3.6rem)] leading-none mb-2 block" />
                  <div className="text-fog text-xs md:text-sm leading-snug">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5 · THE PROOF — real products ──────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36">
          <div className="max-w-3xl mb-12">
            <Reveal><Eyebrow>The proof</Eyebrow></Reveal>
            <ScrollText as="h2" text={'Built to *perform.* \n Not to shine.'}
              className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96] mb-6" />
            <Reveal delay={100}>
              <p className="text-fog text-lg leading-relaxed max-w-xl">
                Built to take the beating. To go the distance. To handle the
                pressure. See for yourself, right below.
              </p>
            </Reveal>
          </div>
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            {proof.map((p, i) => (
              <Reveal key={p!.slug} delay={(i % 4) * 80}><ProductCard product={p!} /></Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="mt-10">
              <Link href="/produkter" className="link-arrow">
                See all the products <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5b · SEE IT IN ACTION — video proof ────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 45% at 50% 40%, rgba(0,136,194,0.08), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36">
          <div className="max-w-3xl mb-12">
            <Reveal><Eyebrow>See it in action</Eyebrow></Reveal>
            <ScrollText as="h2" text={'Words are cheap. \n See for yourself.'}
              className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96] mb-6" />
            <Reveal delay={100}>
              <p className="text-fog text-lg leading-relaxed max-w-xl">
                The tools at work, filmed by our European partners. No studio
                lights, no filters.
              </p>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <div className="max-w-5xl">
              <VideoProof />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5c · WHAT THEY SAY — peer proof ────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
          <div className="max-w-3xl mb-12">
            <Reveal><Eyebrow>From the people who use it</Eyebrow></Reveal>
            <ScrollText as="h2" text={'Don\'t take our word. \n Take *the trade\'s.*'}
              className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96]" />
          </div>
          <Testimonials items={testimonials} />
        </div>
      </section>

      {/* ── 6 · WHAT CHANGES — the payoff ──────────────────────────────── */}
      <section className="relative h-[88svh] min-h-[520px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Images/campaign/tea.jpg" srcSet="/Images/campaign/tea-sm.jpg 1280w, /Images/campaign/tea.jpg 2200w"
          sizes="100vw" alt="Tradesperson drinking from fine china" draggable={false}
          className="absolute inset-0 h-full w-full object-cover grayscale select-none" style={{ objectPosition: '66% 40%' }} />
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'linear-gradient(180deg, #0B0C0E 0%, rgba(11,12,14,0) 22%, rgba(11,12,14,0.25) 60%, #0B0C0E 100%)' }} />
        <div className="relative h-full mx-auto max-w-[1600px] px-6 md:px-10 flex items-end pb-14">
          <Reveal>
            <div className="eyebrow mb-4">What changes</div>
            <h3 className="h-display text-white text-[clamp(1.9rem,4.5vw,3.6rem)] leading-[0.96] mb-3">
              Room for the <span className="text-stroxx-blue">fine china.</span>
            </h3>
            <p className="text-fog text-base md:text-lg max-w-md">
              Same work. Same quality. But there's money left over for the rest
              of life.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 7 · RISK REVERSAL + THE ASK ────────────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 55% at 50% 45%, rgba(0,136,194,0.13), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-28 md:py-44">
          <div className="text-center mb-14 md:mb-20">
            <Reveal><Eyebrow>And if we're wrong?</Eyebrow></Reveal>
            <ScrollText as="h2" text={'100% *happy.* Or \n your money back.'}
              className="h-display text-white text-[clamp(2.6rem,7vw,6rem)] leading-[0.92] mb-8" />
            <Reveal delay={120}>
              <p className="text-fog text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                Still sounds too good to be true? That's exactly
                why we say:{' '}
                <span className="text-stroxx-blue font-semibold tracking-wide">TRY IT.</span>{' '}
                Here's how.
              </p>
            </Reveal>
          </div>

          {/* the three steps */}
          <div className="grid gap-5 md:grid-cols-3 max-w-5xl mx-auto mb-14 md:mb-16">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="glass glass-card rounded-xl p-7 h-full">
                  <div className="h-display text-stroxx-blue text-3xl mb-4">{s.n}</div>
                  <div className="text-white font-medium mb-2">{s.t}</div>
                  <p className="text-fog text-sm leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <BuyCTA label="Buy at Carl Ras" intlLabel="Where to buy" arrow />
                <GlassButton href="/butikker" variant="ghost">Find your store</GlassButton>
              </div>
              <GuaranteeModal />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 8 · FAQ — the objections, answered in plain words ──────────── */}
      <section className="relative border-t border-line">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
          <div className="text-center mb-12">
            <Reveal><Eyebrow>Questions</Eyebrow></Reveal>
            <ScrollText as="h2" text={'What you\'re probably \n *thinking* anyway.'}
              className="h-display text-white text-[clamp(2rem,4.5vw,3.6rem)] leading-[0.96]" />
          </div>
          <Reveal delay={100}>
            <Faq items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
