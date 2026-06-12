import Link from 'next/link';
import BagJourney from '@/components/BagJourney';
import Reveal from '@/components/Reveal';
import ScrollText from '@/components/ScrollText';
import ScrollHint from '@/components/ScrollHint';
import LumaVideo from '@/components/LumaVideo';
import ProductCard from '@/components/ProductCard';
import BuyButton from '@/components/BuyButton';
import GlassButton from '@/components/GlassButton';
import GlassLink from '@/components/GlassLink';
import CountUp from '@/components/CountUp';
import CategoryList from '@/components/CategoryList';
import ParticleImage from '@/components/ParticleImage';
import CursorGlow from '@/components/CursorGlow';
import KnockoutImage from '@/components/KnockoutImage';
import ProvDet from '@/components/ProvDet';
import GuaranteeModal from '@/components/GuaranteeModal';
import CampaignBand from '@/components/CampaignBand';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import {
  specialists,
  featuredCategories,
  particleSrc,
  categoryBuyUrl,
  toolTexture,
  brandImages,
  UTM,
  CR_BRAND,
} from '@/lib/data';
import { SKA } from '@/lib/ska';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow mb-7">{children}</div>;
}

function Marquee({ text }: { text: string }) {
  const items = Array.from({ length: 8 });
  const Row = () => (
    <div className="marquee__track">
      {items.map((_, i) => (
        <span key={i} className="font-display text-3xl md:text-6xl text-white/85 tracking-tightest flex items-center gap-10" style={{ fontWeight: 500 }}>
          {text}<span className="text-stroxx-blue text-2xl">●</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee py-10">
      <Row />
      <Row />
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      {/* the bag falls into the hero, dust puffs, and the tools cascade in on load */}
      <BagJourney />

      {/* HERO — giant wordmark sits high so it reads above the bag, which
          overlaps it slightly. Bag layer (z-20) paints over the headline (z-10). */}
      <section className="relative h-[100svh] min-h-[640px]">
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center px-5 pt-[14vh] md:pt-[13vh]">
          <h1 className="h-display text-white text-[clamp(3rem,13vw,13rem)] leading-[0.86] text-center">
            <span className="hero-line">Dyrt værktøj</span>
            <br />
            <span className="hero-line hero-line--2">til <span className="text-stroxx-blue">udyr</span> pris</span>
          </h1>
        </div>
        <div className="absolute inset-x-0 bottom-8 z-30 hidden lg:flex justify-center">
          <ScrollHint />
        </div>
      </section>

      {/* CLAIM — the promise, front and centre */}
      <section className="relative py-28 md:py-40">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10">
          <div className="max-w-3xl">
            <p className="h-display text-[clamp(2rem,5.2vw,4.8rem)] leading-[1.04]">
              <ScrollText as="span" className="text-white" text="Ligesom alt dit dyre værktøj." />
              <br />
              <ScrollText as="span" className="text-fog" text="Det koster bare ikke" />{' '}
              <ScrollText as="span" className="text-stroxx-blue" text="nær så meget." />
            </p>
            <ScrollText as="p" className="mt-10 text-fog text-lg md:text-xl leading-relaxed max-w-xl"
              text="Fedt værktøj til temmelig tynde priser. Fås kun hos Carl Ras BYG. Og husk: altid 100% tilfredsgaranti, så der ikke er så meget at tænke over." />
          </div>
        </div>
      </section>

      <Marquee text="DYRT VÆRKTØJ TIL UDYR PRIS" />

      {/* SORTIMENT — what we have, and we have your back */}
      <section className="relative py-28 md:py-40">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10 grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <Eyebrow>Sortimentet</Eyebrow>
            <ScrollText as="h2" text={'Vi har det. \n Og vi har dig.'}
              className="h-display text-white text-[clamp(2.6rem,8vw,7rem)] leading-[0.9]" />
          </div>
          <div className="grid gap-12 sm:grid-cols-2">
            <div>
              <div className="text-fog/75 text-xs uppercase tracking-wider mb-3">Udvalget</div>
              <ScrollText as="p" className="text-fog text-base leading-relaxed"
                text="Værktøj, udstyr, tilbehør og forbrugsartikler. Fra lasermålere og savklinger til håndværktøj, topnøglesæt og beskyttelsesudstyr. STROXX har det meste." />
            </div>
            <div>
              <div className="text-fog/75 text-xs uppercase tracking-wider mb-3">Servicen</div>
              <ScrollText as="p" className="text-fog text-base leading-relaxed"
                text="Og vi har din ryg. Så du hverken går forgæves eller hjem med det forkerte. Det er ikke kun værktøjet, der er skarpt." />
            </div>
          </div>
        </div>
      </section>

      {/* SKALA — headline + the scale, capped by a bold stats band */}
      <section className="relative py-28 md:py-36">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 40%, rgba(0,130,202,0.07), transparent 70%)' }} />
        <div className="relative mx-auto w-full max-w-[1600px] px-6 md:px-10">
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <Eyebrow>Skala</Eyebrow>
              <ScrollText as="h2" text={'Mere end \n 1.400 varenumre.'}
                className="h-display text-white text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.9]" />
            </div>
            <div className="grid gap-12 sm:grid-cols-2">
              <div>
                <div className="text-fog/75 text-xs uppercase tracking-wider mb-3">Hverdagen</div>
                <ScrollText as="p" className="text-fog text-base leading-relaxed"
                  text="Uanset om du har brug for en vikingearm eller rene hænder, så har vi det, du skal bruge. I webshoppen på carl-ras.dk og i 26 butikker over hele landet." />
              </div>
              <div>
                <div className="text-fog/75 text-xs uppercase tracking-wider mb-3">Det bedste</div>
                <ScrollText as="p" className="text-fog text-base leading-relaxed"
                  text="Nogle produkter er oplagte, når du bare ikke vil betale for meget. Andre er til dig, der sammenligner specs, ydelse og pris, og vil have det bedste." />
              </div>
            </div>
          </div>

          {/* stats band — full width, vertical dividers */}
          <Reveal delay={120}>
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 rounded-2xl border border-line overflow-hidden">
              {[{ v: 1400, suf: '+', l: 'varenumre' }, { v: 26, suf: '', l: 'butikker i Danmark' }, { v: 227, suf: '+', l: 'butikker i Europa' }].map((s, i) => (
                <div key={s.l} className={`px-8 py-10 ${i > 0 ? 'border-t sm:border-t-0 sm:border-l border-line' : ''}`}>
                  <CountUp value={s.v} suffix={s.suf} className="h-display text-white text-5xl md:text-6xl block" />
                  <div className="text-fog text-sm mt-2">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SPECIALISTS */}
      <section id="specialister" className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-32 md:py-40">
          <div className="mb-16 max-w-3xl">
            <Eyebrow>Specialisterne</Eyebrow>
            <ScrollText as="h2" text="Cand. værktøj med speciale i STROXX"
              className="h-display text-white text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.92]" />
          </div>
          <div className="relative">
            {/* blue light pooling behind the cards — pure gradients, NO css
                filter: blur() on a big layer is the iOS white-box pattern */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{
              background: 'radial-gradient(55% 60% at 28% 32%, rgba(0,130,202,0.16), transparent 70%), radial-gradient(50% 55% at 80% 75%, rgba(43,166,232,0.10), transparent 72%)',
            }} />
            <div className="grid gap-6 lg:gap-8 md:grid-cols-3">
              {specialists.slice(0, 6).map((s, i) => (
                <Reveal key={s.name} delay={(i % 3) * 80} className="h-full">
                  <div className="glass-panel glass-panel--frost glass-panel--glow rounded-2xl p-7 flex flex-col h-full">
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: 3 }).map((_, k) => <span key={k} className="h-1.5 w-1.5 rounded-full bg-stroxx-blue" />)}
                    </div>
                    <blockquote className="text-white text-xl leading-snug mb-7">“{s.quote}”</blockquote>
                    <div className="flex items-center gap-3 mt-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.photo} alt={s.name} className="h-11 w-11 rounded-full object-cover grayscale shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-white text-sm truncate">{s.name}</div>
                        <div className="text-fog text-xs truncate">{s.role} · {s.location}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <GlassLink href={`tel:+45${s.phone}`} label="Ring">
                          <Phone size={15} strokeWidth={2} className="relative" />
                        </GlassLink>
                        <GlassLink href={`mailto:${s.email}`} label="Email">
                          <Mail size={15} strokeWidth={2} className="relative" />
                        </GlassLink>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="relative">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 55% at 50% 50%, rgba(0,130,202,0.12), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-32 md:py-40 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Tilfredsgaranti</Eyebrow>
            <ScrollText as="h2" text={'100%. Eller \n pengene tilbage.'}
              className="h-display text-white text-[clamp(2.6rem,7vw,6rem)] leading-[0.9] mb-8" />
            <ScrollText as="p" className="text-fog text-lg leading-relaxed max-w-xl"
              text="Vi tør godt. Er du ikke tilfreds med dit STROXX-værktøj, får du pengene igen. Så er der ikke så meget at tænke over. Bare at komme i gang." />
            <GuaranteeModal />
          </div>
          <Reveal delay={120} from="far-right">
            <div className="max-w-md mx-auto">
              <LumaVideo src={brandImages.guaranteeFilm} size={560} className="w-full" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* CAMPAIGN — print campaign as a cinematic image series */}
      <CampaignBand />

      {/* MÅNEDENS STROXX — the SKA engine: one hero story + the month's five
          DB2-winners, same lineup as nyhedsbrev/SoMe/kampagner/salg. The hero
          links to its dedicated landing page; everything else buys directly. */}
      <section id="maanedens" className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-28 md:py-36">
          <div className="relative grid gap-14 lg:grid-cols-2 lg:items-center mb-20">
            <CursorGlow size="42% 58%" intensity={0.14} className="-z-10" />
            <Reveal from="left">
              <Eyebrow>Månedens STROXX · {SKA.month} {SKA.year}</Eyebrow>
              <h2 className="h-display text-white text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.92] mb-6">
                Én historie.
                <br /><span className="text-stroxx-blue">{SKA.hero.name}.</span>
              </h2>
              <p className="text-fog text-lg leading-relaxed mb-9 max-w-xl">
                Hver måned får ét stykke værktøj hele historien: hvorfor det vinder,
                hvor det tjener sig hjem, og hvad kollegerne siger. Resten af måneden
                klarer sig selv på prisen.
              </p>
              <div className="flex flex-wrap gap-3">
                <GlassButton href="/maanedens">Hele historien <ArrowRight size={16} /></GlassButton>
                <GlassButton href={`${CR_BRAND}/?${UTM}`} external variant="ghost">Køb hos Carl Ras</GlassButton>
              </div>
            </Reveal>
            <Reveal delay={120} from="far-right">
              <Link href="/maanedens" className="group relative block aspect-[5/4]">
                <div className="pointer-events-none absolute inset-[8%]" style={{ background: 'radial-gradient(45% 42% at 50% 52%, rgba(0,130,202,0.26), transparent 70%)' }} />
                <KnockoutImage
                  src={toolTexture(SKA.hero.imgId, '50383')}
                  alt={SKA.hero.name}
                  maxSize={900}
                  className="absolute inset-[6%] h-[88%] w-[88%] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute bottom-3 left-3 text-fog/75 text-xs uppercase tracking-wider">
                  {SKA.hero.price} DKK · 30 dages garanti
                </div>
              </Link>
            </Reveal>
          </div>

          <Reveal className="mb-8 flex items-end justify-between gap-6">
            <div className="text-fog/75 text-xs uppercase tracking-wider">Månedens fem DB2-vindere</div>
            <Link href="/maanedens" className="link-arrow hidden sm:inline-flex shrink-0 text-sm">
              Hele måneden <ArrowRight size={14} />
            </Link>
          </Reveal>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            {SKA.cashCows.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 5) * 60}><ProductCard product={p} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="kategorier" className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-24">
          <div className="max-w-3xl">
            <Eyebrow>Kategorierne</Eyebrow>
            <ScrollText as="h2" text={'Fyld posen. Kategori \n for kategori.'}
              className="h-display text-white text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.92]" />
          </div>
        </div>

        {featuredCategories.map((f, idx) => (
          <div key={f.cat.slug} className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-28 grid gap-14 lg:grid-cols-2 lg:items-center">
            {/* floating hero product — particle reveal */}
            <Reveal from={idx % 2 ? 'far-right' : 'far-left'} className={idx % 2 ? 'lg:order-2' : ''}>
              <div className="relative aspect-[5/4]">
                <ParticleImage src={particleSrc(f.cat.slug, f.particleImgId)} className="h-full w-full" />
                <div className="absolute top-2 left-2 text-fog/75 text-xs uppercase tracking-wider">{String(idx + 1).padStart(2, '0')} · {f.cat.name}</div>
              </div>
            </Reveal>
            <Reveal delay={120} from={idx % 2 ? 'left' : 'right'} className={idx % 2 ? 'lg:order-1' : ''}>
              <h3 className="h-display text-white text-[clamp(2rem,4.5vw,3.8rem)] leading-[0.95] mb-5">{f.cat.name}</h3>
              <p className="text-fog text-lg leading-relaxed mb-10 max-w-xl">{f.cat.blurb}</p>
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {f.items.slice(0, 2).map((p) => (<ProductCard key={p.slug} product={p} />))}
              </div>
              <a href={categoryBuyUrl(f.cat.path)} target="_blank" rel="noopener noreferrer" className="link-arrow">
                Se hele {f.cat.name.toLowerCase()} hos Carl Ras
                <ArrowRight size={16} strokeWidth={2} />
              </a>
            </Reveal>
          </div>
        ))}

        {/* full category list — typographic, no boxes */}
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-28">
          <Reveal><div className="text-fog/75 text-xs uppercase tracking-wider mb-8">Hele udvalget</div></Reveal>
          <CategoryList />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <ProvDet />
        <BuyButton href={`${CR_BRAND}/?${UTM}`}>Køb STROXX hos Carl Ras</BuyButton>
      </section>
    </main>
  );
}
