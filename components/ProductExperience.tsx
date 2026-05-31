'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import KnockoutImage from '@/components/KnockoutImage';
import Reveal from '@/components/Reveal';
import ScrollText from '@/components/ScrollText';
import GlassLink from '@/components/GlassLink';
import GlassButton from '@/components/GlassButton';
import ProductCard from '@/components/ProductCard';
import ProClubSignup from '@/components/ProClubSignup';
import { Hammer, Wallet, ShieldCheck, Phone, Mail, ArrowRight } from 'lucide-react';
import { Product, Specialist, toolTexture } from '@/lib/data';

// Carl Ras splash colours — match the real badges on carl-ras.dk
const badgeStyle: Record<string, string> = {
  'BLÅ PRIS': 'bg-[#0072BC] text-white', 'POPULÆR': 'bg-[#002C5F] text-white',
  'KAMPAGNE': 'bg-[#EE7F00] text-white', 'BEST I TEST': 'bg-white text-ink',
  'NYHED': 'bg-[#0072BC] text-white', 'OUTLET': 'bg-[#5A6473] text-white', 'MILJØ': 'bg-[#4C9A2A] text-white',
};

type Stop = { p: number; x: number; y: number; s: number; r: number; o: number };
// zig-zag: the product crosses left → right → left → right as you scroll,
// content always lands on the opposite side.
const STOPS: Stop[] = [
  { p: 0.00, x: -24, y: -2, s: 1.0, r: -4, o: 1 },
  { p: 0.30, x: 24, y: 0, s: 0.9, r: 5, o: 1 },
  { p: 0.57, x: -24, y: 0, s: 0.82, r: -4, o: 1 },
  { p: 0.82, x: 24, y: 2, s: 0.78, r: 4, o: 1 },
  { p: 0.93, x: 0, y: 8, s: 0.8, r: 0, o: 0 },
];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function sample(p: number): Omit<Stop, 'p'> {
  if (p <= STOPS[0].p) return STOPS[0];
  if (p >= STOPS[STOPS.length - 1].p) return STOPS[STOPS.length - 1];
  let i = 0; while (i < STOPS.length - 1 && p > STOPS[i + 1].p) i++;
  const a = STOPS[i], b = STOPS[i + 1];
  const t = (p - a.p) / (b.p - a.p);
  const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), s: lerp(a.s, b.s, e), r: lerp(a.r, b.r, e), o: lerp(a.o, b.o, e) };
}

export default function ProductExperience({
  product, related, spec, buyUrl, categoryName, categorySlug,
}: {
  product: Product; related: Product[]; spec: Specialist;
  buyUrl: string; categoryName: string; categorySlug: string;
}) {
  const prodRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const cur = useRef({ x: -24, y: -2, s: 1.0, r: -4, o: 1 });
  const glow = useRef({ x: -24, y: -2, s: 1.15, o: 1, vx: 0, vy: 0 });

  useEffect(() => {
    const pe = prodRef.current, ge = glowRef.current;
    if (!pe) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pe.style.transform = 'translate(-50%,-50%) translate(-24vw,0) scale(0.9)';
      if (ge) ge.style.transform = 'translate(-50%,-50%) translate(-24vw,0)';
      return;
    }
    let raf = 0;
    const c = cur.current, g = glow.current;
    const loop = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const t = sample(p);
      // product — leads the motion: snappy enough that the image clearly drives,
      // so the light reads as chasing it rather than both drifting together.
      c.x = lerp(c.x, t.x, 0.17); c.y = lerp(c.y, t.y, 0.17); c.s = lerp(c.s, t.s, 0.15);
      c.r = lerp(c.r, t.r, 0.15); c.o = lerp(c.o, t.o, 0.2);
      pe.style.transform = `translate(-50%,-50%) translate(${c.x}vw, ${c.y}vh) scale(${c.s}) rotate(${c.r}deg)`;
      pe.style.opacity = String(c.o);
      // blue light — an elastic body that TRAILS the product. Softer spring +
      // low friction make it lag behind, overshoot, then wobble back into place,
      // like a light genuinely tracking the image. Gravity gives it a little sag.
      if (ge) {
        g.vx += (c.x - g.x) * 0.032;
        g.vy += (c.y - g.y) * 0.032 + 0.018; // + gravity (vh/frame²)
        g.vx *= 0.915; g.vy *= 0.915;         // less friction → elastic overshoot
        g.x += g.vx; g.y += g.vy;
        g.s = lerp(g.s, c.s * 1.18, 0.045);
        g.o = lerp(g.o, c.o, 0.1);
        ge.style.transform = `translate(-50%,-50%) translate(${g.x}vw, ${g.y}vh) scale(${g.s})`;
        ge.style.opacity = String(g.o);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const Figure = (size: string, withGlow = true) => (
    <div className="relative">
      {/* blue light pool — kept inline for the static (mobile/wide) layouts;
          on desktop the pinned product hands this to a trailing physics layer */}
      {withGlow && (
        <div className="pointer-events-none absolute -z-10" style={{ inset: '-40%', background: 'radial-gradient(40% 38% at 50% 48%, rgba(0,130,202,0.32), transparent 68%)' }} />
      )}
      <div className="pointer-events-none absolute left-1/2 bottom-[4%] h-10 w-3/5 -translate-x-1/2 rounded-[50%] bg-black/55 blur-2xl" />
      <KnockoutImage src={toolTexture(product.imgId, '50383')} alt={product.name} maxSize={1100} className={`relative w-full ${size}`} />
    </div>
  );

  const Details = (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="eyebrow">STROXX · {categoryName}</div>
        {product.badges.length > 0 && (
          <div className="flex gap-1.5">
            {product.badges.slice(0, 3).map((b) => (
              <span key={b} className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-sm ${badgeStyle[b] ?? 'bg-steel text-white'}`}>{b}</span>
            ))}
          </div>
        )}
      </div>
      <h1 className="h-display text-white text-[clamp(2rem,4.4vw,3.6rem)] leading-[0.98] mb-5">{product.name}</h1>
      {product.blurb && <p className="text-fog text-lg leading-relaxed mb-7 max-w-md">{product.blurb}</p>}
      <div className="flex items-end gap-8 mb-8">
        <div>
          <div className="h-display text-white text-4xl">{product.price}</div>
          <div className="text-fog text-sm mt-1">DKK inkl. moms / {product.unit}</div>
        </div>
        {product.code && <div className="text-fog text-sm pb-1">Kode <span className="text-white">{product.code}</span></div>}
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <GlassButton href={buyUrl} external>Køb hos Carl Ras <ArrowRight size={16} /></GlassButton>
        <GlassButton href="#specifikationer" variant="ghost">Tekniske specs</GlassButton>
      </div>
      <div className="flex items-center gap-2 text-sm text-fog"><span className="h-2 w-2 rounded-full bg-green-500" /> 100% tilfredsgaranti · købet sker hos Carl Ras</div>
    </>
  );

  const usps = [
    { icon: Hammer, title: 'Pro-kvalitet', body: 'Der er kælet for detaljerne — funktion, form, pålidelighed og effektivitet. Bygget til at blive brugt.' },
    { icon: Wallet, title: 'Skarp pris', body: `${product.price} DKK. Samme følelse som de dyre mærker — bare uden mærke-tillægget.` },
    { icon: ShieldCheck, title: '100% tilfredsgaranti', body: 'Ikke tilfreds? Pengene tilbage. Så er der ikke så meget at tænke over — bare at komme i gang.' },
  ];

  const Specs = (
    <Reveal from="left">
      <div className="border border-line rounded-sm overflow-hidden">
        {product.specs.length > 0 ? product.specs.map((s, i) => (
          <div key={s.label + i} className={`flex justify-between gap-6 px-5 py-3.5 text-sm ${i % 2 ? 'bg-carbon' : 'bg-ink'}`}>
            <span className="text-fog">{s.label}</span><span className="text-white font-medium text-right">{s.value}</span>
          </div>
        )) : <div className="px-5 py-4 text-fog text-sm bg-carbon">Specifikationer følger.</div>}
        <div className="flex justify-between gap-6 px-5 py-3.5 text-sm bg-ink border-t border-line">
          <span className="text-fog">Varenummer</span><span className="text-white font-medium">{product.code}</span>
        </div>
      </div>
      <p className="text-fog/60 text-xs mt-3">Specs synkroniseres fra Carl Ras / Digizuite PIM i den endelige løsning.</p>
    </Reveal>
  );

  const Review = (
    <div className="text-center">
      <Reveal><div className="eyebrow mb-8">Anbefalet af specialisterne</div></Reveal>
      <Reveal delay={80}><blockquote className="h-display text-white text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.12] mb-10">“{spec.quote}”</blockquote></Reveal>
      <Reveal delay={160}>
        <div className="flex items-center justify-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spec.photo} alt={spec.name} className="h-12 w-12 rounded-full object-cover grayscale" />
          <div className="text-left"><div className="text-white text-sm">{spec.name}</div><div className="text-fog text-xs">{spec.role} · {spec.location}</div></div>
          <div className="flex gap-2 ml-2">
            <GlassLink href={`tel:+45${spec.phone}`} label="Ring"><Phone size={15} strokeWidth={2} className="relative" /></GlassLink>
            <GlassLink href={`mailto:${spec.email}`} label="Email"><Mail size={15} strokeWidth={2} className="relative" /></GlassLink>
          </div>
        </div>
      </Reveal>
    </div>
  );

  const SellingPoints = (
    <>
      <Reveal><div className="eyebrow mb-5">Hvorfor det er STROXX</div></Reveal>
      <ScrollText as="h2" text={'Samme følelse.\nLangt fra prisen.'} className="h-display text-white text-[clamp(1.8rem,4vw,3.4rem)] leading-[0.95] mb-10" />
      <div className="grid gap-5">
        {usps.map((u, i) => (
          <Reveal key={u.title} delay={i * 90} from="left">
            <div
              className="glass-card rounded-2xl p-6 flex gap-4 items-start border border-white/10 backdrop-blur-xl bg-gradient-to-b from-white/[0.08] to-white/[0.02]"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 22px rgba(255,255,255,0.03)' }}
            >
              <u.icon size={24} strokeWidth={1.6} className="text-stroxx-blue shrink-0 mt-0.5" />
              <div><div className="text-white text-lg font-medium mb-1.5">{u.title}</div><p className="text-fog text-sm leading-relaxed">{u.body}</p></div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );

  const Related = related.length > 0 && (
    <section className="relative z-30 bg-ink">
      {/* long gradient lead-in so the travelling product + its glow dissolve
          into ink instead of being hard-cut by the solid section bg */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -translate-y-full h-[55vh] bg-gradient-to-b from-transparent to-ink" />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-24">
        <Reveal className="mb-10 flex items-end justify-between gap-6">
          <h2 className="h-display text-white text-[clamp(1.6rem,3vw,2.4rem)]">Relateret STROXX-værktøj</h2>
          <Link href={`/produkter?cat=${categorySlug}`} className="link-arrow hidden sm:inline-flex shrink-0">Se hele kategorien <ArrowRight size={15} /></Link>
        </Reveal>
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {related.map((p, i) => (<Reveal key={p.slug} delay={(i % 4) * 70}><ProductCard product={p} /></Reveal>))}
        </div>
      </div>
    </section>
  );

  // ——— ONE universal template for EVERY product, regardless of image aspect:
  // the pinned product cut-out travels & zig-zags down while content scrolls past ———
  return (
    <main className="bg-ink">
      {/* fixed traveling product (desktop) — the light trails the product */}
      <div className="fixed inset-0 z-[20] pointer-events-none hidden lg:block" aria-hidden>
        <div ref={glowRef} className="absolute left-1/2 top-1/2 w-[60vw] h-[64vh] will-change-transform"
          style={{ transform: 'translate(-50%,-50%) translate(-24vw,0)', background: 'radial-gradient(38% 38% at 50% 48%, rgba(0,130,202,0.34), transparent 66%)' }} />
        <div ref={prodRef} className="absolute left-1/2 top-1/2 w-[48vw] max-w-[820px] will-change-transform" style={{ transform: 'translate(-50%,-50%) translate(-24vw,0)' }}>
          {Figure('h-[74vh] min-h-[440px]', false)}
        </div>
      </div>

      {/* mobile inline hero */}
      <div className="lg:hidden px-5 pt-28 pb-2">{Figure('h-[50vh] min-h-[300px]')}</div>

      {/* content column — right half on desktop, full on mobile. Sits above the
          Related section's fade-in gradient so that gradient only darkens the
          empty area the product travels through, never the content (e.g. the
          Pro Club box). */}
      <div className="relative z-40">
        <section className="lg:min-h-[92vh] flex items-center"><div className="mx-auto w-full max-w-[1500px] px-5 md:px-10 lg:flex lg:justify-end"><Reveal from="right" className="lg:w-[46%] pt-10 lg:pt-0">{Details}</Reveal></div></section>
        <section className="lg:min-h-[88vh] flex items-center"><div className="mx-auto w-full max-w-[1500px] px-5 md:px-10 lg:flex lg:justify-start"><div className="lg:w-[46%]">{SellingPoints}</div></div></section>
        <section className="lg:min-h-[80vh] flex items-center"><div className="mx-auto w-full max-w-[1500px] px-5 md:px-10 lg:flex lg:justify-end"><div className="lg:w-[52%]">{Review}</div></div></section>
        <section id="specifikationer" className="lg:min-h-[88vh] flex items-center scroll-mt-24"><div className="mx-auto w-full max-w-[1500px] px-5 md:px-10 lg:flex lg:justify-start"><div className="lg:w-[46%]"><Reveal><div className="eyebrow mb-5">Specifikationer</div></Reveal><ScrollText as="h2" text="Tallene bag værktøjet." className="h-display text-white text-[clamp(1.8rem,4vw,3rem)] mb-8" />{Specs}<div className="mt-10"><ProClubSignup /></div></div></div></section>
      </div>

      {Related}
    </main>
  );
}
