import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import GlassButton from '@/components/GlassButton';
import GuaranteeModal from '@/components/GuaranteeModal';
import Faq from '@/components/Faq';
import { ArrowRight, FileText, Phone, RotateCcw, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Service og support',
  description:
    'Alt det praktiske samlet ét sted: STROXX 30 dages tilfredshedsgaranti, returnering, dokumenter og direkte kontakt til Carl Ras kundeservice og specialisterne.',
};

/* Service & support hub: the boring-but-vital page competitors have and value
   brands forget. Everything is grounded in the real guarantee terms
   (public/STROXX-tilfredshedsgaranti.pdf). Datasheets for kemi arrive with the
   DAM integration. */

/* Handel sker altid hos Carl Ras → de juridiske dokumenter bor dér. */
const DOCS = [
  { label: 'Tilfredshedsgaranti, fulde vilkår (PDF)', href: '/STROXX-tilfredshedsgaranti.pdf' },
  { label: 'Salgs- og leveringsbetingelser (Carl Ras)', href: 'https://www.carl-ras.dk/kundeservice/salgs-og-leveringsbetingelser/' },
  { label: 'Persondatapolitik (Carl Ras)', href: 'https://www.carl-ras.dk/kundeservice/persondatapolitik/' },
  { label: 'Cookiepolitik (Carl Ras)', href: 'https://www.carl-ras.dk/kundeservice/cookiepolitik/' },
];

/* FAQ: same answers rendered as accordion AND as FAQPage JSON-LD. Plain-text
   versions feed the schema; the accordion may add links. */
const SERVICE_FAQ = [
  {
    q: 'Hvem kan bruge tilfredshedsgarantien?',
    a: 'Erhvervskunder med konto hos Carl Ras. Har du ikke en konto endnu, opretter du den hos Carl Ras under "Bliv kunde", og så gælder de 30 dage også for dig.',
  },
  {
    q: 'Skal varen være ubrugt, når jeg returnerer den?',
    a: 'Nej, det er hele pointen. Garantien er til 30 dage på rigtigt arbejde, ikke fem minutter i indkørslen. Tag varen med i din Carl Ras butik sammen med faktura eller følgeseddel. Ved mængdekøb gælder garantien den først købte vare.',
  },
  {
    q: 'Hvad gør jeg, hvis varen er defekt?',
    a: 'Fejl og mangler er ikke en garantisag men en reklamation, og den klarer Carl Ras efter deres salgs- og leveringsbetingelser. Tag varen med i butikken eller ring til kundeservice på 44 85 55 11.',
  },
  {
    q: 'Hvordan foregår levering og fragt?',
    a: 'Alt køb sker hos Carl Ras, i butik eller på carl-ras.dk, og leveringsmuligheder og priser vises ved bestillingen. De fulde vilkår står i Carl Ras salgs- og leveringsbetingelser.',
  },
  {
    q: 'Hvor finder jeg sikkerhedsdatablade for kemi-produkter?',
    a: 'De er på vej til denne side. Indtil da udleverer Carl Ras kundeservice dem på 44 85 55 11 eller i din lokale butik.',
  },
];

const RETURN_STEPS = [
  {
    t: 'Find faktura eller følgeseddel',
    d: 'Garantien gælder erhvervskunder med konto hos Carl Ras. Dit købsbevis er nok, varen behøver ikke fejle noget.',
  },
  {
    t: 'Gå til din Carl Ras butik',
    d: 'Aflever varen i en af de 26 butikker. Har du købt online, ringer du til kundeservice på 44 85 55 11 i stedet.',
  },
  {
    t: 'Pengene tilbage',
    d: 'Ingen diskussion og ingen krav om fejl. Din vurdering er nok. Ved mængdekøb gælder garantien den først købte vare.',
  },
];

export default function ServicePage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SERVICE_FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main className="bg-ink min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="mx-auto max-w-[1400px] px-5 md:px-8 pb-28 pt-32 md:pt-40">
        {/* hero */}
        <div className="max-w-2xl">
          <Reveal>
            <div className="eyebrow mb-4">Service og support</div>
            <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95]">
              Hjælpen er lige så ligetil <span className="text-stroxx-blue">som prisen.</span>
            </h1>
            <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">
              Ingen formularer i ti trin og ingen ventemusik. Her er garantien, returneringen,
              dokumenterne og menneskene, samlet ét sted.
            </p>
          </Reveal>
        </div>

        {/* guarantee */}
        <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <Reveal>
            <div className="glass glass-card rounded-xl p-8 h-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-stroxx-blue/50 text-stroxx-blue"><ShieldCheck size={18} /></span>
                <h2 className="text-white font-display font-bold text-2xl">30 dages tilfredshedsgaranti</h2>
              </div>
              <p className="text-fog leading-relaxed mb-4">
                Prøv STROXX på rigtigt arbejde i 30 dage. Er du ikke tilfreds, får du pengene
                tilbage. Ingen krav om fejl, din vurdering er nok. Gælder alle STROXX-produkter
                undtagen adgangskontrol, for erhvervskunder med konto hos Carl Ras.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <GlassButton href="/proev-det">Sådan virker det <ArrowRight size={15} /></GlassButton>
                <GuaranteeModal />
              </div>
            </div>
          </Reveal>

          {/* returns */}
          <Reveal delay={100}>
            <div className="glass glass-card rounded-xl p-8 h-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-stroxx-blue/50 text-stroxx-blue"><RotateCcw size={18} /></span>
                <h2 className="text-white font-display font-bold text-2xl">Sådan returnerer du</h2>
              </div>
              <div className="space-y-5">
                {RETURN_STEPS.map((s, i) => (
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
                <h2 className="text-white font-display font-bold text-2xl">Dokumenter</h2>
              </div>
              <div className="space-y-3">
                {DOCS.map((d) => (
                  <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 rounded-lg border border-line px-5 py-4 text-sm text-white transition-colors hover:border-stroxx-blue/50">
                    {d.label}
                    <ArrowRight size={15} className="shrink-0 text-stroxx-blue" />
                  </a>
                ))}
                <div className="rounded-lg border border-dashed border-line px-5 py-4 text-sm text-fog">
                  Produktkataloger og sikkerhedsdatablade for kemi kommer her, når DAM-integrationen
                  er på plads.
                </div>
              </div>
            </div>
          </Reveal>

          {/* contact */}
          <Reveal delay={100}>
            <div className="glass glass-card rounded-xl p-8 h-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-stroxx-blue/50 text-stroxx-blue"><Phone size={18} /></span>
                <h2 className="text-white font-display font-bold text-2xl">Snak med et menneske</h2>
              </div>
              <p className="text-fog leading-relaxed mb-5">
                Carl Ras kundeservice sidder klar på{' '}
                <a href="tel:+4544855511" className="text-stroxx-blue hover:underline">44 85 55 11</a>{' '}
                (man-tor 07-16, fre 07-15). Eller spring køen over og ring direkte til en specialist
                i din nærmeste butik.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <GlassButton href="/butikker?tab=specialister">Find din specialist <ArrowRight size={15} /></GlassButton>
                <GlassButton href="/butikker" variant="ghost">Alle butikker</GlassButton>
              </div>
            </div>
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="mt-24 border-t border-line pt-16">
          <div className="text-center mb-10">
            <Reveal>
              <div className="eyebrow mb-3">Spørgsmål og svar</div>
              <h2 className="h-display text-white text-[clamp(1.8rem,4vw,3rem)] leading-[0.96]">
                Det praktiske, helt kort.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={100}>
            <Faq
              items={SERVICE_FAQ.map((f) => ({
                q: f.q,
                a:
                  f.q === 'Hvem kan bruge tilfredshedsgarantien?' ? (
                    <>
                      Erhvervskunder med konto hos Carl Ras. Har du ikke en konto endnu, opretter du den hos{' '}
                      <a href="https://www.carl-ras.dk/kundeservice/bliv-kunde/" target="_blank" rel="noopener noreferrer" className="text-stroxx-blue hover:underline">
                        Carl Ras under &ldquo;Bliv kunde&rdquo;
                      </a>
                      , og så gælder de 30 dage også for dig.
                    </>
                  ) : f.q === 'Hvad gør jeg, hvis varen er defekt?' ? (
                    <>
                      Fejl og mangler er ikke en garantisag men en reklamation, og den klarer Carl Ras efter deres{' '}
                      <a href="https://www.carl-ras.dk/kundeservice/salgs-og-leveringsbetingelser/" target="_blank" rel="noopener noreferrer" className="text-stroxx-blue hover:underline">
                        salgs- og leveringsbetingelser
                      </a>
                      . Tag varen med i butikken eller ring til kundeservice på <a href="tel:+4544855511" className="text-stroxx-blue hover:underline">44 85 55 11</a>.
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
