import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import GlassButton from '@/components/GlassButton';
import GuaranteeModal from '@/components/GuaranteeModal';
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
  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8 pb-28 pt-32 md:pt-40">
        {/* hero */}
        <div className="max-w-2xl">
          <Reveal>
            <div className="eyebrow mb-4">Service og support</div>
            <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95]">
              Hjælpen er lige så ligetil som prisen.
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
                <a href="/STROXX-tilfredshedsgaranti.pdf" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-line px-5 py-4 text-sm text-white transition-colors hover:border-stroxx-blue/50">
                  Tilfredshedsgaranti, fulde vilkår (PDF)
                  <ArrowRight size={15} className="text-stroxx-blue" />
                </a>
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

        {/* faq pointer */}
        <Reveal delay={120}>
          <div className="mt-14 text-fog text-sm">
            Flere spørgsmål? Se <Link href="/proev-det" className="text-stroxx-blue hover:underline">de oftest stillede spørgsmål på kampagnesiden</Link>.
          </div>
        </Reveal>
      </div>
    </main>
  );
}
