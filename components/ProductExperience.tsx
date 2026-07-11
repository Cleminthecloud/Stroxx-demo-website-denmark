'use client';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import KnockoutImage from '@/components/KnockoutImage';
import Reveal from '@/components/Reveal';
import ScrollText from '@/components/ScrollText';
import GlassLink from '@/components/GlassLink';
import GlassButton from '@/components/GlassButton';
import BuyCTA from '@/components/BuyCTA';
import { useDealerChooser } from '@/components/DealerChooser';
import { dealerBuyUrl } from '@/lib/buy';
import ProductCard from '@/components/ProductCard';
import ProClubSignup from '@/components/ProClubSignup';
import { Hammer, Wallet, ShieldCheck, Phone, Mail, ArrowRight } from 'lucide-react';
import { Product, Specialist, toolTexture } from '@/lib/data';

// Carl Ras splash colours, matched to the real badges on carl-ras.dk
const badgeStyle: Record<string, string> = {
  'VALUE': 'bg-[#0072BC] text-white', 'POPULAR': 'bg-[#002C5F] text-white',
  'CAMPAIGN': 'bg-[#EE7F00] text-white', 'BEST IN TEST': 'bg-white text-ink',
  'NEW': 'bg-[#0072BC] text-white', 'OUTLET': 'bg-[#5A6473] text-white', 'ECO': 'bg-[#4C9A2A] text-white',
};

type Stop = { p: number; x: number; y: number; s: number; r: number; o: number };
// zig-zag: the product stays out in the side GUTTER opposite the content, and
// shrinks + dims as it descends so the dense lower info (specs, Pro Club) reads
// cleanly. It's a background actor, never crossing into the content column.
const STOPS: Stop[] = [
  { p: 0.00, x: -27, y: -2, s: 0.96, r: -4, o: 1 },
  { p: 0.30, x: 29, y: 0, s: 0.84, r: 5, o: 0.9 },
  { p: 0.57, x: -30, y: 0, s: 0.74, r: -4, o: 0.74 },
  { p: 0.78, x: 30, y: 2, s: 0.68, r: 4, o: 0.55 },
  // gone BEFORE the Related grid + footer — the z-50 buy tag used to linger
  // visibly over both near the bottom of the page
  { p: 0.86, x: 30, y: 8, s: 0.66, r: 4, o: 0 },
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
  product, related, spec, categoryName, categorySlug, proClubHeadline, proClubText,}: {
  product: Product; related: Product[]; spec: Specialist;
  categoryName: string; categorySlug: string; proClubHeadline?: string; proClubText?: string;}) {
  const { currentDealer, open } = useDealerChooser();
  /* No dealer URL (international, or a dealer market missing its Buy-at CTA link
     in the CMS) → the buy links open the dealer chooser. The href stays inert
     ('#') so right-click / long-press / copy-link never leaks another market's
     shop (the old fallback exposed the Carl Ras deep-link on international). */
  const dealerHref = dealerBuyUrl(currentDealer, product.code);
  const onBuyClick = !dealerHref ? (e: MouseEvent) => { e.preventDefault(); open(); } : undefined;
  const buyHref = dealerHref ?? '#';
  const prodRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLAnchorElement>(null);
  const cur = useRef({ x: -24, y: -2, s: 1.0, r: -4, o: 1 });
  const glow = useRef({ x: -24, y: -2, s: 1.15, o: 1, vx: 0, vy: 0 });
  const [pastHero, setPastHero] = useState(false); // drives the mobile sticky buy-bar

  useEffect(() => {
    const pe = prodRef.current, ge = glowRef.current;
    if (!pe) return;
    // the traveling layer is hidden below lg — don't burn a rAF loop on phones
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
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
      // crossing the content zone: backdrop-filter on the glass panels can NOT
      // blur this GPU-promoted fixed layer (documented limitation), so the
      // product blurs + dims ITSELF while it transits the middle of the
      // viewport — sharp when parked in the side gutter, a soft ghost while
      // passing the info. Desktop-only layer (hidden lg:block), so the
      // no-filters-below-lg iOS rule is respected.
      const cross = Math.max(0, 1 - Math.abs(c.x) / 18); // 0 in gutter → 1 at centre
      pe.style.filter = cross > 0.02 ? `blur(${(cross * 14).toFixed(1)}px)` : 'none';
      pe.style.opacity = String(c.o * (1 - cross * 0.5));
      // buy tag — rides the product's x/y (no scale/rotate, so it stays upright &
      // legible), sitting just under its base. Fades in once the hero has left so
      // it doesn't duplicate the hero CTA, and fades out with the product.
      const te = tagRef.current;
      if (te) {
        // lower-right corner of the product (offsets scale with it), so it clears
        // the product's face instead of covering it
        te.style.transform = `translate(-50%,-50%) translate(${c.x + c.s * 13}vw, ${c.y + c.s * 25}vh)`;
        // fade in after the hero, and OUT a beat before the product dies so the
        // tag never ghosts over Related/footer (it sits at z-50, above content)
        const o = Math.min(1, Math.max(0, (p - 0.07) / 0.1)) * Math.min(1, Math.max(0, (0.82 - p) / 0.05)) * c.o;
        te.style.opacity = String(o);
        te.style.pointerEvents = o > 0.6 ? 'auto' : 'none';
      }
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

  // mobile: reveal the sticky buy-bar once the user scrolls past the hero
  useEffect(() => {
    const onScroll = () => {
      const v = window.scrollY > window.innerHeight * 0.55;
      setPastHero((prev) => (prev === v ? prev : v));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const Figure = (size: string, withGlow = true) => (
    <div className="relative">
      {/* blue light pool — kept inline for the static (mobile/wide) layouts;
          on desktop the pinned product hands this to a trailing physics layer */}
      {withGlow && (
        <div className="pointer-events-none absolute -z-10" style={{ inset: '-40%', background: 'radial-gradient(40% 38% at 50% 48%, rgba(0,136,194,0.32), transparent 68%)' }} />
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
      <div className="mb-8">
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-6 gap-y-1 text-fog text-sm">
          {product.code && <span>Item no: <span className="text-white">{product.code}</span></span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <BuyCTA code={product.code} arrow />
        <GlassButton href="#specifikationer" variant="ghost">Technical specs</GlassButton>
      </div>
      <div className="flex items-center gap-2 text-sm text-fog"><span className="h-2 w-2 rounded-full bg-green-500" /> 100% satisfaction guarantee · {currentDealer ? `purchase happens at ${currentDealer.dealerName}` : 'sold through your local STROXX dealer'}</div>
    </>
  );

  const usps = [
    { icon: Hammer, title: 'Pro quality', body: 'Every detail is dialed in: function, form, reliability and efficiency. Built to be used.' },
    { icon: Wallet, title: 'Sharp value', body: 'The same feel as the premium brands, just without the brand markup.' },
    { icon: ShieldCheck, title: '100% satisfaction guarantee', body: 'Not happy? Money back. So there is nothing to think over. Just get going.' },
  ];

  const Specs = (
    <Reveal from="left">
      <div className="glass-panel glass-panel--frost rounded-xl overflow-hidden">
        {product.specs.length > 0 ? product.specs.map((s, i) => (
          <div key={s.label + i} className={`flex justify-between gap-6 px-5 py-3.5 text-sm ${i % 2 ? 'bg-white/[0.045]' : 'bg-transparent'}`}>
            <span className="text-fog">{s.label}</span><span className="text-white font-medium text-right">{s.value}</span>
          </div>
        )) : <div className="px-5 py-4 text-fog text-sm">Specifications to follow.</div>}
        <div className="flex justify-between gap-6 px-5 py-3.5 text-sm bg-white/[0.02] border-t border-white/10">
          <span className="text-fog">Item number</span><span className="text-white font-medium">{product.code}</span>
        </div>
      </div>
    </Reveal>
  );

  const Review = (
    <div className="text-center">
      <Reveal><div className="eyebrow mb-8">Recommended by the specialists</div></Reveal>
      <Reveal delay={80}><blockquote className="h-display text-white text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.12] mb-10">“{spec.quote}”</blockquote></Reveal>
      <Reveal delay={160}>
        <div className="flex items-center justify-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={spec.photo} alt={spec.name} className="h-12 w-12 rounded-full object-cover grayscale" />
          <div className="text-left"><div className="text-white text-sm">{spec.name}</div><div className="text-fog text-xs">{spec.role} · {spec.location}</div></div>
          <div className="flex gap-2 ml-2">
            <GlassLink href={`tel:+45${spec.phone}`} label="Call"><Phone size={15} strokeWidth={2} className="relative" /></GlassLink>
            <GlassLink href={`mailto:${spec.email}`} label="Email"><Mail size={15} strokeWidth={2} className="relative" /></GlassLink>
          </div>
        </div>
      </Reveal>
    </div>
  );

  const SellingPoints = (
    <>
      <Reveal><div className="eyebrow mb-5">Why it is STROXX</div></Reveal>
      <ScrollText as="h2" text={'Same feel.\nFar from the price.'} className="h-display text-white text-[clamp(1.8rem,4vw,3.4rem)] leading-[0.95] mb-10" />
      <div className="grid gap-5">
        {usps.map((u, i) => (
          <Reveal key={u.title} delay={i * 90} from="left">
            <div className="glass-card glass-panel glass-panel--frost rounded-2xl p-6 flex gap-4 items-start">
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
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24">
        <Reveal className="mb-10 flex items-end justify-between gap-6">
          <h2 className="h-display text-white text-[clamp(1.6rem,3vw,2.4rem)]">Related STROXX tools</h2>
          <Link href={`/products?cat=${categorySlug}`} className="link-arrow hidden sm:inline-flex shrink-0">See the whole category <ArrowRight size={15} /></Link>
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
      <div className="fixed inset-0 z-[20] overflow-hidden pointer-events-none hidden lg:block" aria-hidden>
        <div ref={glowRef} className="absolute left-1/2 top-1/2 w-[60vw] h-[64vh] will-change-transform"
          style={{ transform: 'translate(-50%,-50%) translate(-24vw,0)', background: 'radial-gradient(38% 38% at 50% 48%, rgba(0,136,194,0.34), transparent 66%)' }} />
        <div ref={prodRef} className="absolute left-1/2 top-1/2 w-[42vw] max-w-[680px] will-change-transform" style={{ transform: 'translate(-50%,-50%) translate(-27vw,0)' }}>
          {Figure('h-[66vh] min-h-[400px]', false)}
        </div>
      </div>

      {/* buy tag riding the product (desktop) — own layer ABOVE the content so the
          pill is clickable (layer is pointer-events-none; only the pill is auto,
          so it never blocks scroll or text selection elsewhere) */}
      <div className="fixed inset-0 z-[50] pointer-events-none hidden lg:block">
        <a ref={tagRef} href={buyHref} onClick={onBuyClick} target="_blank" rel="noopener noreferrer"
          className="group absolute left-1/2 top-1/2 flex items-center gap-3.5 rounded-2xl pl-4 pr-2.5 py-2.5 backdrop-blur-xl border border-white/[0.12]"
          style={{ opacity: 0, transform: 'translate(-50%,-50%)', willChange: 'transform, opacity',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 14px 34px rgba(0,0,0,0.5), 0 0 28px rgba(0,136,194,0.16)' }}>
          <span className="text-left leading-tight">
            <span className="block text-white text-[13px] font-medium truncate max-w-[190px]">{product.name}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-stroxx-blue px-3.5 py-2.5 text-xs font-semibold text-white transition-colors group-hover:bg-[#006aa8]">
            Buy <ArrowRight size={14} strokeWidth={2} />
          </span>
        </a>
      </div>

      {/* mobile inline hero */}
      <div className="lg:hidden px-5 pt-28 pb-2">{Figure('h-[50vh] min-h-[300px]')}</div>

      {/* content column — right half on desktop, full on mobile. Sits above the
          Related section's fade-in gradient so that gradient only darkens the
          empty area the product travels through, never the content (e.g. the
          Pro Club box). */}
      <div className="relative z-40">
        <section className="lg:min-h-[92vh] flex items-center"><div className="mx-auto w-full max-w-[1600px] px-6 md:px-10 lg:flex lg:justify-end"><Reveal from="right" className="lg:w-[46%] pt-10 lg:pt-0">{Details}</Reveal></div></section>
        <section className="lg:min-h-[88vh] flex items-center"><div className="mx-auto w-full max-w-[1600px] px-6 md:px-10 lg:flex lg:justify-start"><div className="lg:w-[46%]">{SellingPoints}</div></div></section>
        <section className="lg:min-h-[80vh] flex items-center"><div className="mx-auto w-full max-w-[1600px] px-6 md:px-10 lg:flex lg:justify-end"><div className="lg:w-[52%]">{Review}</div></div></section>
        <section id="specifikationer" className="lg:min-h-[88vh] flex items-center scroll-mt-24"><div className="mx-auto w-full max-w-[1600px] px-6 md:px-10 lg:flex lg:justify-start"><div className="lg:w-[46%]"><Reveal><div className="eyebrow mb-5">Specifications</div></Reveal><ScrollText as="h2" text="The numbers behind the tool." className="h-display text-white text-[clamp(1.8rem,4vw,3rem)] mb-8" />{Specs}<div className="mt-10"><ProClubSignup headline={proClubHeadline} text={proClubText} /></div></div></div></section>
      </div>

      {Related}

      {/* mobile sticky buy-bar — the product is inline (doesn't travel) on mobile,
          so the riding tag becomes a slim pinned bar that slides up after the hero */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 transition-transform duration-300 ease-out ${pastHero ? 'translate-y-0' : 'translate-y-[140%]'}`}
        style={{ pointerEvents: pastHero ? 'auto' : 'none' }}
      >
        <div className="glass-panel rounded-2xl flex items-center gap-3 px-4 py-3">
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-white text-sm font-medium truncate">{product.name}</span>
          </span>
          <a href={buyHref} onClick={onBuyClick} target="_blank" rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-stroxx-blue px-5 py-2.5 text-sm font-semibold text-white">
            Buy <ArrowRight size={15} strokeWidth={2} />
          </a>
        </div>
      </div>
    </main>
  );
}
