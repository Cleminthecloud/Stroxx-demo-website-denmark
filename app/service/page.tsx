import { getSiteSettings } from '@/lib/cms';
import { stegaClean } from '@sanity/client/stega';
import Accent from '@/components/Accent';
import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import GlassButton from '@/components/GlassButton';
import GuaranteeModal from '@/components/GuaranteeModal';
import Faq from '@/components/Faq';
import Link from 'next/link';
import { ArrowRight, FileText, Phone, RotateCcw, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Service and Support',
  description:
    'Everything practical in one place: the STROXX 30-day satisfaction guarantee, returns, documents and direct contact with Carl Ras customer service and the specialists.',
};

/* Service & support hub: the boring-but-vital page competitors have and value
   brands forget. Everything is grounded in the real guarantee terms
   (public/STROXX-tilfredshedsgaranti.pdf). Datasheets for kemi arrive with the
   DAM integration. */

/* Handel sker altid hos Carl Ras → de juridiske dokumenter bor dér. */
const DOCS = [
  { label: 'Satisfaction guarantee, full terms (PDF)', href: '/STROXX-tilfredshedsgaranti.pdf' },
  { label: 'Terms of sale and delivery (Carl Ras)', href: 'https://www.carl-ras.dk/kundeservice/salgs-og-leveringsbetingelser/' },
  { label: 'Privacy policy (Carl Ras)', href: 'https://www.carl-ras.dk/kundeservice/persondatapolitik/' },
  { label: 'Cookie policy (Carl Ras)', href: 'https://www.carl-ras.dk/kundeservice/cookiepolitik/' },
];

/* FAQ: same answers rendered as accordion AND as FAQPage JSON-LD. Plain-text
   versions feed the schema; the accordion may add links. */
const SERVICE_FAQ = [
  {
    q: 'Who can use the satisfaction guarantee?',
    a: 'Business customers with an account at Carl Ras. If you don\'t have an account yet, you set one up at Carl Ras under "Become a customer", and then the 30 days apply to you too.',
  },
  {
    q: 'Does the item have to be unused when I return it?',
    a: 'No, that\'s the whole point. The guarantee is for 30 days on real work, not five minutes in the driveway. Bring the item to your Carl Ras store along with the invoice or delivery note. For bulk purchases, the guarantee applies to the first item bought.',
  },
  {
    q: 'What do I do if the item is defective?',
    a: 'Faults and defects are not a guarantee matter but a complaint, and Carl Ras handles that under their terms of sale and delivery. Bring the item to the store or call customer service on 44 85 55 11.',
  },
  {
    q: 'How do delivery and shipping work?',
    a: 'Every purchase is made at Carl Ras, in store or at carl-ras.dk, and delivery options and prices are shown at checkout. The full terms are in the Carl Ras terms of sale and delivery.',
  },
  {
    q: 'Where do I find safety data sheets for chemical products?',
    a: 'They\'re on their way to this page. Until then, Carl Ras customer service provides them on 44 85 55 11 or in your local store.',
  },
];

const RETURN_STEPS = [
  {
    t: 'Find your invoice or delivery note',
    d: 'The guarantee applies to business customers with an account at Carl Ras. Your proof of purchase is enough, the item doesn\'t need to be faulty.',
  },
  {
    t: 'Go to your Carl Ras store',
    d: 'Hand the item in at one of the 26 stores. If you bought online, call customer service on 44 85 55 11 instead.',
  },
  {
    t: 'Money back',
    d: 'No discussion and no need for faults. Your judgment is enough. For bulk purchases, the guarantee applies to the first item bought.',
  },
];

export default async function ServicePage() {
  const cms = await getSiteSettings();

  const guaranteeHeading = cms?.serviceGuaranteeHeading || '30-day satisfaction guarantee';
  const guaranteeBody =
    cms?.serviceGuaranteeBody ||
    "Try STROXX on real work for 30 days. If you're not happy, you get your money back. No need for faults, your judgment is enough. Applies to all STROXX products except access control, for business customers with an account at Carl Ras.";
  const returnsHeading = cms?.serviceReturnsHeading || 'How to return';
  const returnSteps = cms?.serviceReturnSteps?.length
    ? cms.serviceReturnSteps.map((s) => ({ t: s.title ?? '', d: s.body ?? '' }))
    : RETURN_STEPS;
  const docsHeading = cms?.serviceDocsHeading || 'Documents';
  const docs = cms?.serviceDocs?.length
    ? cms.serviceDocs.map((d) => ({ label: d.label ?? '', href: stegaClean(d.href) ?? '' })).filter((d) => d.label && d.href)
    : DOCS;
  const docsPending =
    cms?.serviceDocsPending ||
    'Product catalogues and safety data sheets for chemicals will appear here once the DAM integration is in place.';
  const contactHeading = cms?.serviceContactHeading || 'Talk to a human';
  const faqEyebrow = cms?.serviceFaqEyebrow || 'Questions and answers';
  const faqHeadingText = cms?.serviceFaqHeading || 'The practical stuff, in brief.';
  const faqSrc: { q: string; a: string; linkText?: string; linkUrl?: string }[] = cms?.serviceFaq?.length
    ? cms.serviceFaq.map((f) => ({ q: f.question ?? '', a: f.answer ?? '', linkText: f.linkText, linkUrl: f.linkUrl }))
    : SERVICE_FAQ.map((f) => ({ q: f.q, a: f.a }));

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqSrc.map((f) => ({
      '@type': 'Question',
      name: stegaClean(f.q),
      acceptedAnswer: { '@type': 'Answer', text: stegaClean(f.a) },
    })),
  };
  return (
    <main className="bg-ink min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pb-28 pt-32 md:pt-40">
        {/* hero */}
        <div className="max-w-2xl">
          <Reveal>
            <div className="eyebrow mb-4">Service and Support</div>
            <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95]">
              <Accent text={cms?.serviceHeadline || 'Help is as straightforward *as the tools.*'} />
            </h1>
            <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">
              {cms?.serviceIntro || "No ten-step forms and no hold music. Here's the guarantee, the returns, the documents and the people, all in one place."}
            </p>
          </Reveal>
        </div>

        {/* guarantee */}
        <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <Reveal>
            <div className="glass glass-card rounded-xl p-8 h-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-stroxx-blue/50 text-stroxx-blue"><ShieldCheck size={18} /></span>
                <h2 className="text-white font-display font-bold text-2xl">{guaranteeHeading}</h2>
              </div>
              <p className="text-fog leading-relaxed mb-4">{guaranteeBody}</p>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <GlassButton href="/proev-det">How it works <ArrowRight size={15} /></GlassButton>
                <GuaranteeModal />
              </div>
            </div>
          </Reveal>

          {/* returns */}
          <Reveal delay={100}>
            <div className="glass glass-card rounded-xl p-8 h-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-stroxx-blue/50 text-stroxx-blue"><RotateCcw size={18} /></span>
                <h2 className="text-white font-display font-bold text-2xl">{returnsHeading}</h2>
              </div>
              <div className="space-y-5">
                {returnSteps.map((s, i) => (
                  <div key={s.t} className="flex gap-4">
                    <span className="h-display text-stroxx-blue text-xl leading-snug">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <div className="text-white font-medium mb-1">{s.t}</div>
                      <p className="text-fog text-sm leading-relaxed">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* documents */}
        <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <Reveal>
            <div className="glass glass-card rounded-xl p-8 h-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-stroxx-blue/50 text-stroxx-blue"><FileText size={18} /></span>
                <h2 className="text-white font-display font-bold text-2xl">{docsHeading}</h2>
              </div>
              <div className="space-y-3">
                <Link href="/support" className="flex items-center justify-between gap-4 rounded-lg border border-stroxx-blue/40 bg-stroxx-blue/[0.06] px-5 py-4 text-white transition-colors hover:border-stroxx-blue/70">
                  <span>
                    <span className="block text-sm font-medium">Product manuals, guides &amp; videos</span>
                    <span className="block text-fog/70 text-xs mt-0.5">User instructions and software guides by product, in your language.</span>
                  </span>
                  <ArrowRight size={15} className="shrink-0 text-stroxx-blue" />
                </Link>
                {docs.map((d) => (
                  <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 rounded-lg border border-line px-5 py-4 text-sm text-white transition-colors hover:border-stroxx-blue/50">
                    {d.label}
                    <ArrowRight size={15} className="shrink-0 text-stroxx-blue" />
                  </a>
                ))}
                <div className="rounded-lg border border-dashed border-line px-5 py-4 text-sm text-fog">
                  {docsPending}
                </div>
              </div>
            </div>
          </Reveal>

          {/* contact */}
          <Reveal delay={100}>
            <div className="glass glass-card rounded-xl p-8 h-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-stroxx-blue/50 text-stroxx-blue"><Phone size={18} /></span>
                <h2 className="text-white font-display font-bold text-2xl">{contactHeading}</h2>
              </div>
              {cms?.serviceContactBody ? (
                <p className="text-fog leading-relaxed mb-5">{cms.serviceContactBody}</p>
              ) : (
                <p className="text-fog leading-relaxed mb-5">
                  Carl Ras customer service is ready on{' '}
                  <a href="tel:+4544855511" className="text-stroxx-blue hover:underline">44 85 55 11</a>{' '}
                  (Mon-Thu 07-16, Fri 07-15). Or skip the queue and call a specialist
                  directly at your nearest store.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <GlassButton href="/butikker?tab=specialister">Find your specialist <ArrowRight size={15} /></GlassButton>
                <GlassButton href="/butikker" variant="ghost">All stores</GlassButton>
              </div>
            </div>
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="mt-24 border-t border-line pt-16">
          <div className="text-center mb-10">
            <Reveal>
              <div className="eyebrow mb-3">{faqEyebrow}</div>
              <h2 className="h-display text-white text-[clamp(1.8rem,4vw,3rem)] leading-[0.96]">
                <Accent text={faqHeadingText} />
              </h2>
            </Reveal>
          </div>
          <Reveal delay={100}>
            <Faq
              items={faqSrc.map((f) => ({
                q: f.q,
                a:
                  f.q === 'Who can use the satisfaction guarantee?' ? (
                    <>
                      Business customers with an account at Carl Ras. If you don&rsquo;t have an account yet, you set one up at{' '}
                      <a href="https://www.carl-ras.dk/kundeservice/bliv-kunde/" target="_blank" rel="noopener noreferrer" className="text-stroxx-blue hover:underline">
                        Carl Ras under &ldquo;Become a customer&rdquo;
                      </a>
                      , and then the 30 days apply to you too.
                    </>
                  ) : f.q === 'What do I do if the item is defective?' ? (
                    <>
                      Faults and defects are not a guarantee matter but a complaint, and Carl Ras handles that under their{' '}
                      <a href="https://www.carl-ras.dk/kundeservice/salgs-og-leveringsbetingelser/" target="_blank" rel="noopener noreferrer" className="text-stroxx-blue hover:underline">
                        terms of sale and delivery
                      </a>
                      . Bring the item to the store or call customer service on <a href="tel:+4544855511" className="text-stroxx-blue hover:underline">44 85 55 11</a>.
                    </>
                  ) : f.linkText && f.linkUrl ? (
                    <>
                      {f.a}{' '}
                      <a href={stegaClean(f.linkUrl)} target="_blank" rel="noopener noreferrer" className="text-stroxx-blue hover:underline">
                        {f.linkText}
                      </a>
                    </>
                  ) : (
                    f.a
                  ),
              }))}
            />
          </Reveal>
        </section>
      </div>
    </main>
  );
}
