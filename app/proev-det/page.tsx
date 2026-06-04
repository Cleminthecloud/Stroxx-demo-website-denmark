import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import ScrollText from '@/components/ScrollText';
import GlassButton from '@/components/GlassButton';
import ProductCard from '@/components/ProductCard';
import GuaranteeModal from '@/components/GuaranteeModal';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { products, CR_BRAND, UTM } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Få råd til andet end værktøj — STROXX',
  description:
    'Du betaler for logoet, ikke for stålet. STROXX er professionel kvalitet uden mærke-tillæg, med 100% tilfredshedsgaranti. Prøv det i 30 dage.',
};

/* Landing structure follows the conversion narrative:
   1 hero hook → 2 name the frustration → 3 the habit (why the brain picks the
   expensive brand) → 4 the reframe (how it's possible) → 5 proof (products +
   prices) → 6 what changes (payoff image) → 7 risk reversal + clear next step.
   One full-bleed photo only; the rest carries the argument. */

// the proof: four workhorses with real prices
const PROOF_CODES = ['34011573', '34009021', '35011812', '35011846'];

const STEPS = [
  {
    n: '01',
    t: 'Find din butik',
    d: '26 butikker i hele landet, eller køb online hos Carl Ras. Tag værktøjet i hånden først, hvis du vil.',
  },
  {
    n: '02',
    t: 'Brug det på rigtigt arbejde',
    d: 'Ikke fem minutter i indkørslen. 30 dage på pladsen, hvor det gælder.',
  },
  {
    n: '03',
    t: 'Glad? Ellers pengene tilbage',
    d: 'Er du ikke tilfreds, får du pengene igen. Ingen krav om fejl, din vurdering er nok.',
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow mb-6">{children}</div>;
}

export default function ProevDetPage() {
  const proof = PROOF_CODES.map((c) => products.find((p) => p.code === c)).filter(Boolean);
  const buy = `${CR_BRAND}/?${UTM}`;

  return (
    <main className="bg-ink">
      {/* ── 1 · HERO — the hook ────────────────────────────────────────── */}
      <section className="relative h-[100svh] min-h-[560px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Images/campaign/rings.jpg" srcSet="/Images/campaign/rings-sm.jpg 1280w, /Images/campaign/rings.jpg 2200w"
          sizes="100vw" alt="Håndværker med ringe og hammer" draggable={false}
          className="absolute inset-0 h-full w-full object-cover grayscale select-none" style={{ objectPosition: '62% 35%' }} />
        <div className="pointer-events-none absolute inset-0 hidden lg:block" style={{
          background: 'linear-gradient(90deg, rgba(8,9,11,0.93) 0%, rgba(8,9,11,0.66) 34%, rgba(8,9,11,0.18) 62%, rgba(8,9,11,0) 82%)' }} />
        <div className="pointer-events-none absolute inset-0 lg:hidden" style={{
          background: 'linear-gradient(180deg, rgba(8,9,11,0.35) 0%, rgba(8,9,11,0) 30%, rgba(8,9,11,0.5) 55%, rgba(8,9,11,0.97) 100%)' }} />
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(11,12,14,0.6) 0%, rgba(11,12,14,0) 18%, rgba(11,12,14,0) 80%, #0B0C0E 100%)' }} />

        <div className="relative h-full mx-auto max-w-[1600px] px-6 md:px-10 flex items-end pb-14 lg:items-center lg:pb-0">
          <div className="max-w-2xl">
            <Eyebrow>Kampagne · Prøv det</Eyebrow>
            <h1 className="h-display text-white text-[clamp(2.6rem,7vw,6rem)] leading-[0.92] mb-6">
              Dyrt værktøj.<br />Til udyr pris.
            </h1>
            <p className="text-fog text-base md:text-xl leading-relaxed mb-8 max-w-lg">
              Professionelt værktøj uden logo-tillæg. Og ja, det lyder for godt
              til at være sandt. Derfor får du 30 dage til at modbevise os.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <GlassButton href={buy} external>Køb hos Carl Ras <ArrowRight size={16} /></GlassButton>
              <a href="#fornemmelsen" className="link-arrow text-sm">Hvorfor så billigt? <ArrowDown size={15} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · THE FRUSTRATION — name what they feel ──────────────────── */}
      <section id="fornemmelsen" className="relative scroll-mt-24">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-28 md:py-40">
          <div className="max-w-4xl">
            <Reveal><Eyebrow>Fornemmelsen</Eyebrow></Reveal>
            <ScrollText as="h2" text={'Du betaler ikke for værktøjet. \n Du betaler for navnet.'}
              className="h-display text-white text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.96] mb-10" />
            <Reveal delay={120}>
              <p className="text-fog text-lg md:text-xl leading-relaxed max-w-2xl">
                En ny maskine, et sæt bits, en kniv. Du lægger den på disken og
                betaler en pris, du har lært at acceptere. Men et sted bagerst
                i hovedet ved du det godt: en del af beløbet går ikke til
                stålet i din hånd. Det går til reklamerne, sponsoraterne og
                logoet på siden.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 3 · THE HABIT — why the brain picks the expensive brand ───── */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 30% 50%, rgba(0,130,202,0.07), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36">
          <div className="max-w-4xl lg:ml-auto lg:text-right">
            <Reveal><Eyebrow>Vanen</Eyebrow></Reveal>
            <ScrollText as="h2" text={'Dyrt føles sikkert. \n Det er hele tricket.'}
              className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96] mb-10" />
            <Reveal delay={100}>
              <p className="text-fog text-lg md:text-xl leading-relaxed max-w-2xl lg:ml-auto mb-6">
                Når du står med to stykker værktøj, vælger hjernen det dyre.
                Ikke fordi du har testet det, men fordi prisen føles som en
                garanti. Og fordi ingen bliver til grin for at købe det kendte
                mærke.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="text-white text-lg md:text-xl leading-relaxed max-w-2xl lg:ml-auto">
                Men pris måler ikke kvalitet. Tolerancer, materialer og
                holdbarhed gør. Og de står ikke på prisskiltet.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 4 · THE REFRAME — how it's possible ────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 50%, rgba(0,130,202,0.10), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36 grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal><Eyebrow>Sådan kan det lade sig gøre</Eyebrow></Reveal>
            <ScrollText as="h2" text={'Samme stål. \n Uden mærke-tillæg.'}
              className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96] mb-8" />
            <Reveal delay={100}>
              <p className="text-fog text-lg leading-relaxed max-w-xl mb-6">
                STROXX udvikles i et tæt samarbejde mellem fagfolk i Danmark,
                Tyskland, Frankrig og Belgien. Vi sætter selv specifikationerne,
                vælger selv materialerne og dropper alle unødvendige led,
                logo-præmier og fordyrende mellemregninger.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <p className="text-white text-lg leading-relaxed max-w-xl">
                Det, du betaler for, er værktøjet. Ikke reklamerne for det.
              </p>
            </Reveal>
          </div>
          <Reveal delay={140} from="right">
            <div className="grid grid-cols-3 gap-6 lg:gap-8">
              {[
                { n: '4', l: 'lande bag udviklingen' },
                { n: '227+', l: 'butikker i Europa' },
                { n: '1.400+', l: 'varenumre' },
              ].map((s) => (
                <div key={s.l} className="text-center lg:text-left">
                  <div className="h-display text-white text-[clamp(2rem,4.5vw,3.6rem)] leading-none mb-2">{s.n}</div>
                  <div className="text-fog text-xs md:text-sm leading-snug">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5 · THE PROOF — real products, real prices ─────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36">
          <div className="max-w-3xl mb-12">
            <Reveal><Eyebrow>Beviserne</Eyebrow></Reveal>
            <ScrollText as="h2" text={'Lavet til at præstere. \n Ikke til at skinne.'}
              className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96] mb-6" />
            <Reveal delay={100}>
              <p className="text-fog text-lg leading-relaxed max-w-xl">
                Bygget til at klare mosten. Til at stå distancen. Til at tage
                presset. Se selv, priserne står lige nedenunder.
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
                Se alle produkterne <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 6 · WHAT CHANGES — the payoff ──────────────────────────────── */}
      <section className="relative h-[88svh] min-h-[520px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Images/campaign/tea.jpg" srcSet="/Images/campaign/tea-sm.jpg 1280w, /Images/campaign/tea.jpg 2200w"
          sizes="100vw" alt="Håndværker drikker af fint porcelæn" draggable={false}
          className="absolute inset-0 h-full w-full object-cover grayscale select-none" style={{ objectPosition: '66% 40%' }} />
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'linear-gradient(180deg, #0B0C0E 0%, rgba(11,12,14,0) 22%, rgba(11,12,14,0.25) 60%, #0B0C0E 100%)' }} />
        <div className="relative h-full mx-auto max-w-[1600px] px-6 md:px-10 flex items-end pb-14">
          <Reveal>
            <div className="eyebrow mb-4">Det, der ændrer sig</div>
            <h3 className="h-display text-white text-[clamp(1.9rem,4.5vw,3.6rem)] leading-[0.96] mb-3">
              Råd til det fine porcelæn.
            </h3>
            <p className="text-fog text-base md:text-lg max-w-md">
              Samme arbejde. Samme kvalitet. Men der er penge tilbage til
              resten af livet.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 7 · RISK REVERSAL + THE ASK ────────────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 55% at 50% 45%, rgba(0,130,202,0.13), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-28 md:py-44">
          <div className="text-center mb-14 md:mb-20">
            <Reveal><Eyebrow>Og hvis vi tager fejl?</Eyebrow></Reveal>
            <ScrollText as="h2" text={'100% glad. Eller \n pengene tilbage.'}
              className="h-display text-white text-[clamp(2.6rem,7vw,6rem)] leading-[0.92] mb-8" />
            <Reveal delay={120}>
              <p className="text-fog text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                Lyder det stadig for godt til at være sandt? Det er præcis
                derfor, vi siger: Prøv det. Sådan her gør du.
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
                <GlassButton href={buy} external>Køb hos Carl Ras <ArrowRight size={16} /></GlassButton>
                <GlassButton href="/butikker" variant="ghost">Find din butik</GlassButton>
              </div>
              <GuaranteeModal />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
