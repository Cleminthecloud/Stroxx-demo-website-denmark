import BagScroller from '@/components/BagScroller';
import Reveal from '@/components/Reveal';
import ScrollText from '@/components/ScrollText';
import ScrollHint from '@/components/ScrollHint';
import LumaVideo from '@/components/LumaVideo';
import ProductCard from '@/components/ProductCard';
import BuyButton from '@/components/BuyButton';
import GlassLink from '@/components/GlassLink';
import CountUp from '@/components/CountUp';
import CategoryList from '@/components/CategoryList';
import ParticleImage from '@/components/ParticleImage';
import CursorGlow from '@/components/CursorGlow';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import {
  specialists,
  featuredCategories,
  toolTexture,
  categoryBuyUrl,
  brandImages,
  UTM,
  CR_BRAND,
} from '@/lib/data';

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
    <main className="relative">
      {/* the bag travels through the page as you scroll */}
      <BagScroller />

      {/* HERO — giant wordmark, bag centred on top */}
      <section className="relative z-10 h-screen flex items-center justify-center">
        <h1 className="h-display text-white text-[clamp(3rem,13vw,13rem)] leading-[0.86] text-center px-5">
          Dyrt værktøj
          <br />til <span className="text-stroxx-blue">udyr</span> pris
        </h1>
        <div className="absolute inset-x-0 bottom-8 flex justify-center">
          <ScrollHint />
        </div>
      </section>

      {/* ACT 1 — brand claim, bag swings right */}
      <section className="relative z-40 min-h-screen flex items-center">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10">
          <div className="max-w-3xl">
            <p className="h-display text-[clamp(2rem,5.2vw,4.8rem)] leading-[1.04]">
              <ScrollText as="span" className="text-white" text="Ligesom alt dit dyre værktøj." />
              <br />
              <ScrollText as="span" className="text-fog" text="Det koster bare ikke" />{' '}
              <ScrollText as="span" className="text-stroxx-blue" text="nær så meget." />
            </p>
            <ScrollText as="p" className="mt-10 text-fog text-lg md:text-xl leading-relaxed max-w-xl"
              text="Fedt værktøj til temmelig tynde priser. Fås kun hos Carl Ras BYG — og husk: altid 100% tilfredsgaranti, så der ikke er så meget at tænke over." />
          </div>
        </div>
      </section>

      <div className="relative z-40"><Marquee text="DYRT VÆRKTØJ TIL UDYR PRIS" /></div>

      {/* ACT 2 — Vi har det, bag swings left, text right */}
      <section className="relative z-40 min-h-screen flex items-center">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10 flex md:justify-end">
          <div className="max-w-2xl">
            <Eyebrow>Sortimentet</Eyebrow>
            <ScrollText as="h2" text={'Vi har det. \n Og vi har dig.'}
              className="h-display text-white text-[clamp(2.6rem,8vw,7rem)] leading-[0.9] mb-14" />
            <div className="grid gap-12 sm:grid-cols-2">
              <div>
                <div className="text-fog/50 text-xs uppercase tracking-wider mb-3">Udvalget</div>
                <ScrollText as="p" className="text-fog text-base leading-relaxed"
                  text="Værktøj, udstyr, tilbehør og forbrugsartikler. Fra lasermålere og savklinger til håndværktøj, topnøglesæt og beskyttelsesudstyr — STROXX har det meste." />
              </div>
              <div>
                <div className="text-fog/50 text-xs uppercase tracking-wider mb-3">Servicen</div>
                <ScrollText as="p" className="text-fog text-base leading-relaxed"
                  text="Og vi har din ryg. Så du hverken går forgæves eller hjem med det forkerte. Det er ikke kun værktøjet, der er skarpt." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACT 3 — 1.400 varenumre, bag swings right, text left */}
      <section className="relative z-40 min-h-screen flex items-center">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10">
          <div className="max-w-2xl">
            <Eyebrow>Skala</Eyebrow>
            <ScrollText as="h2" text={'Mere end \n 1.400 varenumre.'}
              className="h-display text-white text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.9] mb-14" />
            <div className="grid gap-12 sm:grid-cols-2">
              <div>
                <div className="text-fog/50 text-xs uppercase tracking-wider mb-3">Hverdagen</div>
                <ScrollText as="p" className="text-fog text-base leading-relaxed"
                  text="Uanset om du har brug for en vikingearm eller rene hænder, så har vi det, du skal bruge. I webshoppen på carl-ras.dk og i 23 engroscentre over hele landet." />
              </div>
              <div>
                <div className="text-fog/50 text-xs uppercase tracking-wider mb-3">Det bedste</div>
                <ScrollText as="p" className="text-fog text-base leading-relaxed"
                  text="Nogle produkter er oplagte, når du bare ikke vil betale for meget. Andre er til dig, der sammenligner specs, ydelse og pris — og vil have det bedste." />
              </div>
            </div>
            <Reveal delay={200}>
              <div className="mt-16 flex flex-wrap gap-x-16 gap-y-8">
                {[{ v: 1400, suf: '+', l: 'varenumre' }, { v: 23, suf: '', l: 'engroscentre' }, { v: 227, suf: '+', l: 'butikker i Europa' }].map((s) => (
                  <div key={s.l}>
                    <CountUp value={s.v} suffix={s.suf} className="h-display text-white text-5xl block" />
                    <div className="text-fog text-sm mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SPECIALISTS — testimonial row (bag has faded) */}
      <section id="specialister" className="relative z-40">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-40">
          <div className="mb-20 max-w-3xl">
            <Eyebrow>Specialisterne</Eyebrow>
            <ScrollText as="h2" text="Cand. værktøj med speciale i STROXX"
              className="h-display text-white text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.92]" />
          </div>
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-3">
            {specialists.slice(0, 6).map((s, i) => (
              <Reveal key={s.name} delay={(i % 3) * 80}>
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 3 }).map((_, k) => <span key={k} className="h-1.5 w-1.5 rounded-full bg-stroxx-blue" />)}
                </div>
                <blockquote className="text-white text-xl leading-snug mb-7">“{s.quote}”</blockquote>
                <div className="flex items-center gap-3 mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.photo} alt={s.name} className="h-11 w-11 rounded-full object-cover grayscale" />
                  <div className="min-w-0">
                    <div className="text-white text-sm">{s.name}</div>
                    <div className="text-fog text-xs">{s.role} · {s.location}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <GlassLink href={`tel:+45${s.phone}`} label="Ring">
                    <Phone size={15} strokeWidth={2} className="relative" />
                  </GlassLink>
                  <GlassLink href={`mailto:${s.email}`} label="Email">
                    <Mail size={15} strokeWidth={2} className="relative" />
                  </GlassLink>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="relative z-40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 55% at 50% 50%, rgba(0,130,202,0.12), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-40 grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Tilfredsgaranti</Eyebrow>
            <ScrollText as="h2" text={'100%. Eller \n pengene tilbage.'}
              className="h-display text-white text-[clamp(2.6rem,7vw,6rem)] leading-[0.9] mb-8" />
            <ScrollText as="p" className="text-fog text-lg leading-relaxed max-w-xl"
              text="Vi tør godt. Er du ikke tilfreds med dit STROXX-værktøj, får du pengene igen. Så er der ikke så meget at tænke over — bare at komme i gang." />
          </div>
          <Reveal delay={120}>
            <div className="max-w-md mx-auto">
              <LumaVideo src={brandImages.guaranteeFilm} size={560} className="w-full" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="kategorier" className="relative z-40">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-24">
          <div className="max-w-3xl">
            <Eyebrow>Kategorierne</Eyebrow>
            <ScrollText as="h2" text={'Fyld posen. Kategori \n for kategori.'}
              className="h-display text-white text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.92]" />
          </div>
        </div>

        {featuredCategories.map((f, idx) => (
          <div key={f.cat.slug} className="mx-auto max-w-[1600px] px-6 md:px-10 py-28 grid gap-14 lg:grid-cols-2 lg:items-center">
            {/* floating hero product — lit cut-out, no awkward crop */}
            <Reveal className={idx % 2 ? 'lg:order-2' : ''}>
              <div className="relative aspect-[5/4]">
                <CursorGlow size="52% 54%" intensity={0.2} />
                <ParticleImage src={toolTexture(f.hero.imgId)} className="h-full w-full" />
                <div className="absolute top-2 left-2 text-fog/50 text-xs uppercase tracking-wider">{String(idx + 1).padStart(2, '0')} — {f.cat.name}</div>
              </div>
            </Reveal>
            <Reveal delay={120} className={idx % 2 ? 'lg:order-1' : ''}>
              <h3 className="h-display text-white text-[clamp(2rem,4.5vw,3.8rem)] leading-[0.95] mb-5">{f.cat.name}</h3>
              <p className="text-fog text-lg leading-relaxed mb-10 max-w-xl">{f.cat.blurb}</p>
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {f.items.slice(0, 2).map((p) => (<ProductCard key={p.slug} product={p} />))}
              </div>
              <a href={categoryBuyUrl(f.cat.path)} target="_blank" rel="noopener noreferrer" className="group/cta inline-flex items-center gap-1.5 text-stroxx-blue text-sm hover:text-white transition-colors">
                Se hele {f.cat.name.toLowerCase()} hos Carl Ras
                <ArrowRight size={16} strokeWidth={2} className="transition-transform group-hover/cta:translate-x-1" />
              </a>
            </Reveal>
          </div>
        ))}

        {/* full category list — typographic, no boxes */}
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-28">
          <Reveal><div className="text-fog/50 text-xs uppercase tracking-wider mb-8">Hele udvalget</div></Reveal>
          <CategoryList />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-40 h-[80vh] flex flex-col items-center justify-center text-center px-6">
        <ScrollText as="h2" text="Prøv det."
          className="h-display text-white text-[clamp(3rem,11vw,11rem)] leading-[0.86] mb-12" />
        <BuyButton href={`${CR_BRAND}/?${UTM}`}>Køb STROXX hos Carl Ras</BuyButton>
      </section>
    </main>
  );
}
