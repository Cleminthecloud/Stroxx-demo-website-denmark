'use client';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import Accent from '@/components/Accent';
import ParticleImage from '@/components/ParticleImage';
import CursorGlow from '@/components/CursorGlow';
import GlassButton from '@/components/GlassButton';
import { ArrowRight, LayoutGrid, X } from 'lucide-react';
import { products, categories, categoryBySlug, particleSrc } from '@/lib/data';
import { dealerCategoryUrl } from '@/lib/buy';
import { useDealerChooser } from '@/components/DealerChooser';

type Sort = 'pop' | 'new';

export default function ProductExplorer({ headline, intro }: { headline?: string; intro?: string } = {}) {
  const params = useSearchParams();
  /* market-first category CTA: the current dealer's shop, never a hand-written
     Carl Ras link; international (no dealer) hides the external CTA */
  const { currentDealer } = useDealerChooser();
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('pop');
  /* mobile chip-row affordances: edge fades while the row can scroll, the
     active chip keeps itself in view, and a bottom sheet lists every
     category for a one-tap jump (the row stays the fast path; the sheet is
     for category fifteen of twenty). lg+ wraps the chips, so none of this
     kicks in there. */
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [fade, setFade] = useState({ left: false, right: false });
  const [sheetOpen, setSheetOpen] = useState(false);

  const updateFade = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setFade({ left: max > 4 && el.scrollLeft > 4, right: max > 4 && el.scrollLeft < max - 4 });
  }, []);

  useEffect(() => {
    updateFade();
    const el = rowRef.current;
    el?.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);
    return () => {
      el?.removeEventListener('scroll', updateFade);
      window.removeEventListener('resize', updateFade);
    };
  }, [updateFade]);

  /* keep the active chip visible: scroll the ROW only (never the page) */
  useEffect(() => {
    const row = rowRef.current;
    if (!row || row.scrollWidth <= row.clientWidth) return;
    const btn = row.querySelector<HTMLButtonElement>(active ? `[data-chip="${active}"]` : '[data-chip="all"]');
    if (!btn) return;
    const target = btn.offsetLeft - row.clientWidth / 2 + btn.clientWidth / 2;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({ left: Math.max(0, target), behavior: reduce ? 'auto' : 'smooth' });
  }, [active]);

  /* bottom sheet: lock the page scroll and close on Escape while open */
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheetOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [sheetOpen]);

  const pick = (slug: string | null) => {
    setActive(slug);
    setSheetOpen(false);
  };

  useEffect(() => {
    // unconditional: navigating to plain /products must CLEAR a previous
    // ?cat= / ?q= (conditional set left stale filters behind)
    setActive(params.get('cat'));
    // deep-linkable search: /products?q=... (also used by the WebSite
    // SearchAction schema so answer engines can construct search URLs)
    setQ(params.get('q') ?? '');
  }, [params]);

  // categories that actually have products in the current product snapshot
  const populated = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return categories.filter((c) => set.has(c.slug));
  }, []);

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    let list = products.filter((p) => {
      const inCat = !active || p.tags.includes(active);
      // match name OR varenummer (pros reorder by item number)
      const inQ = !nq || p.name.toLowerCase().includes(nq) || (p.code ?? '').includes(nq);
      return inCat && inQ;
    });
    if (sort === 'pop') list = [...list].sort((a, b) => b.badges.length - a.badges.length);
    // Carl Ras item numbers ascend over time → highest code = newest product
    if (sort === 'new') list = [...list].sort((a, b) => Number(b.code ?? 0) - Number(a.code ?? 0));
    return list;
  }, [active, q, sort]);

  const activeCat = active ? categoryBySlug(active) : null;
  const catHero = useMemo(() => {
    if (!active) return null;
    const items = products.filter((p) => p.tags.includes(active));
    return items.find((p) => p.hero) ?? items[0] ?? null;
  }, [active]);

  return (
    <div className="mx-auto max-w-[1600px] px-6 md:px-10 pb-24">
      {/* header — generic finder intro, or a particle hero for the active category */}
      {activeCat && catHero ? (
        <div className="relative pt-28 md:pt-36 pb-8 grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <CursorGlow size="40% 60%" intensity={0.16} className="-z-10" />
          <Reveal from="left">
            <div className="eyebrow mb-4">Category</div>
            <h1 className="h-display text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.95] text-white">
              {activeCat.name}
            </h1>
            <p className="mt-5 text-fog text-lg max-w-md">{activeCat.blurb}</p>
            {currentDealer && dealerCategoryUrl(currentDealer, activeCat.path) && (
              <div className="mt-7">
                <GlassButton href={dealerCategoryUrl(currentDealer, activeCat.path)!} external>
                  See all {activeCat.name.toLowerCase()} at {currentDealer.dealerName} <ArrowRight size={16} />
                </GlassButton>
              </div>
            )}
          </Reveal>
          <Reveal from="far-right" className="relative aspect-[5/4]">
            <ParticleImage key={activeCat.slug} src={particleSrc(activeCat.slug, catHero.imgId)} className="h-full w-full" />
          </Reveal>
        </div>
      ) : (
        <div className="relative pt-28 md:pt-36 pb-8 grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <Reveal from="left">
            <div className="eyebrow mb-4">Products</div>
            <h1 className="h-display text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.95] text-white">
              <Accent text={headline || 'Find your STROXX tool'} />
            </h1>
            <p className="mt-5 text-fog text-lg max-w-md">
              {intro || 'Filter the range and jump straight to the buy at your dealer. A selection of the 1,400+ item numbers. The purchase always happens on the dealer platform.'}
            </p>
          </Reveal>
          <Reveal from="far-right" className="relative aspect-[5/4]">
            {/* gradient-gray wordmark → particles span the whole blue ramp */}
            <ParticleImage key="alle" src="/Images/particle-logo.png" className="h-full w-full" />
          </Reveal>
        </div>
      )}

      {/* controls — below lg the 21 chips collapse to ONE horizontally
          scrollable row (13 wrapped rows of sticky chips ate the whole phone
          viewport); lg+ keeps the wrapped layout */}
      <div className="sticky top-14 z-30 -mx-6 md:-mx-10 px-6 md:px-10 pt-4 lg:pt-5 pb-3 lg:pb-4 bg-ink/95 backdrop-blur-md border-b border-line mb-10">
        <div className="flex flex-col gap-3 lg:gap-4">
          <div
            ref={rowRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 md:-mx-10 md:px-10 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible"
            style={{
              /* edge fades = "there is more this way"; only while scrollable */
              maskImage:
                fade.left || fade.right
                  ? `linear-gradient(90deg, ${fade.left ? 'transparent, black 44px' : 'black'}, black calc(100% - 44px), ${fade.right ? 'transparent' : 'black'})`
                  : undefined,
              WebkitMaskImage:
                fade.left || fade.right
                  ? `linear-gradient(90deg, ${fade.left ? 'transparent, black 44px' : 'black'}, black calc(100% - 44px), ${fade.right ? 'transparent' : 'black'})`
                  : undefined,
            }}
          >
            <button
              data-chip="all"
              onClick={() => setActive(null)}
              className={`press shrink-0 text-sm px-3.5 py-1.5 rounded-full border ${
                !active ? 'bg-stroxx-blue border-stroxx-blue text-white' : 'border-line text-fog hover:text-white hover:border-white/25'
              }`}
            >
              All
            </button>
            {populated.map((c) => (
              <button
                key={c.slug}
                data-chip={c.slug}
                onClick={() => setActive(c.slug)}
                className={`press shrink-0 text-sm px-3.5 py-1.5 rounded-full border whitespace-nowrap ${
                  active === c.slug ? 'bg-stroxx-blue border-stroxx-blue text-white' : 'border-line text-fog hover:text-white hover:border-white/25'
                }`}
              >
                {c.name}
              </button>
            ))}
            {/* the one-tap jump for far-away categories; lg+ shows all chips wrapped */}
            <button
              onClick={() => setSheetOpen(true)}
              className="press shrink-0 lg:hidden inline-flex items-center gap-1.5 text-sm px-3.5 py-1.5 rounded-full border border-line text-fog hover:text-white hover:border-white/25 whitespace-nowrap"
              aria-haspopup="dialog"
            >
              <LayoutGrid size={13} /> All categories
            </button>
          </div>
          <div className="flex items-center gap-3 justify-between overflow-x-auto no-scrollbar -mx-6 px-6 md:-mx-10 md:px-10 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or item number…"
              className="flex-1 min-w-[160px] bg-carbon border border-line rounded-full px-4 py-2.5 text-base sm:text-sm text-white placeholder:text-fog/60 focus:border-fog outline-none"
            />
            <div className="flex items-center gap-2 text-sm shrink-0">
              <span className="text-fog hidden sm:inline">Sort:</span>
              {([['pop', 'Popular'], ['new', 'Newest']] as [Sort, string][]).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setSort(k)}
                  className={`press shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full border ${
                    sort === k ? 'border-white text-white' : 'border-line text-fog hover:text-white hover:border-white/25'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── the category sheet (mobile): every category in a grid, one tap ── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            aria-label="Close categories"
            onClick={() => setSheetOpen(false)}
            className="backdrop-in absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="All categories"
            className="overlay-in absolute inset-x-0 bottom-0 max-h-[75svh] overflow-y-auto rounded-t-2xl border-t border-line bg-carbon px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="eyebrow !mb-0">Categories</div>
              <button
                autoFocus
                onClick={() => setSheetOpen(false)}
                aria-label="Close"
                className="press grid h-9 w-9 place-items-center rounded-full border border-line text-fog hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => pick(null)}
                className={`press rounded-lg border px-3 py-2.5 text-left text-sm ${
                  !active ? 'border-stroxx-blue bg-stroxx-blue/15 text-white' : 'border-line text-fog hover:text-white hover:border-white/25'
                }`}
              >
                All products
              </button>
              {populated.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => pick(c.slug)}
                  className={`press rounded-lg border px-3 py-2.5 text-left text-sm leading-snug ${
                    active === c.slug ? 'border-stroxx-blue bg-stroxx-blue/15 text-white' : 'border-line text-fog hover:text-white hover:border-white/25'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="text-fog text-sm mb-6">{filtered.length} products</div>

      {filtered.length === 0 ? (
        <div className="text-fog py-20 text-center">No products match. Try another category.</div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
