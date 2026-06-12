'use client';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import ParticleImage from '@/components/ParticleImage';
import CursorGlow from '@/components/CursorGlow';
import GlassButton from '@/components/GlassButton';
import { ArrowRight } from 'lucide-react';
import { products, categories, categoryBySlug, categoryBuyUrl, particleSrc } from '@/lib/data';

const parsePrice = (s: string) => parseFloat(s.replace(/\./g, '').replace(',', '.'));

type Sort = 'pop' | 'new' | 'low' | 'high';

export default function ProductExplorer() {
  const params = useSearchParams();
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('pop');

  useEffect(() => {
    // unconditional: navigating to plain /produkter must CLEAR a previous
    // ?cat= / ?q= (conditional set left stale filters behind)
    setActive(params.get('cat'));
    // deep-linkable search: /produkter?q=... (also used by the WebSite
    // SearchAction schema so answer engines can construct search URLs)
    setQ(params.get('q') ?? '');
  }, [params]);

  // categories that actually have products in this demo dataset
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
    if (sort === 'low') list = [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sort === 'high') list = [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
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
    <div className="mx-auto max-w-[1400px] px-5 md:px-8 pb-24">
      {/* header — generic finder intro, or a particle hero for the active category */}
      {activeCat && catHero ? (
        <div className="relative pt-28 md:pt-36 pb-8 grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <CursorGlow size="40% 60%" intensity={0.16} className="-z-10" />
          <Reveal from="left">
            <div className="eyebrow mb-4">Kategori</div>
            <h1 className="h-display text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.95] text-white">
              {activeCat.name}
            </h1>
            <p className="mt-5 text-fog text-lg max-w-md">{activeCat.blurb}</p>
            <div className="mt-7">
              <GlassButton href={categoryBuyUrl(activeCat.path)} external>
                Se hele {activeCat.name.toLowerCase()} hos Carl Ras <ArrowRight size={16} />
              </GlassButton>
            </div>
          </Reveal>
          <Reveal from="far-right" className="relative aspect-[5/4]">
            <ParticleImage key={activeCat.slug} src={particleSrc(activeCat.slug, catHero.imgId)} className="h-full w-full" />
          </Reveal>
        </div>
      ) : (
        <div className="relative pt-28 md:pt-36 pb-8 grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <Reveal from="left">
            <div className="eyebrow mb-4">Produkter</div>
            <h1 className="h-display text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.95] text-white">
              Find dit STROXX-værktøj
            </h1>
            <p className="mt-5 text-fog text-lg max-w-md">
              Filtrér i sortimentet og spring direkte til købet hos Carl Ras. Et udpluk
              af de 1.400+ varenumre. Købet sker altid på partnerens platform.
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
      <div className="sticky top-14 z-30 -mx-5 md:-mx-8 px-5 md:px-8 pt-4 lg:pt-5 pb-3 lg:pb-4 bg-ink/95 backdrop-blur-md border-b border-line mb-10">
        <div className="flex flex-col gap-3 lg:gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:-mx-8 md:px-8 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible">
            <button
              onClick={() => setActive(null)}
              className={`shrink-0 text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                !active ? 'bg-stroxx-blue border-stroxx-blue text-white' : 'border-line text-fog hover:text-white hover:border-white/25'
              }`}
            >
              Alle
            </button>
            {populated.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`shrink-0 text-sm px-3.5 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                  active === c.slug ? 'bg-stroxx-blue border-stroxx-blue text-white' : 'border-line text-fog hover:text-white hover:border-white/25'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 justify-between overflow-x-auto no-scrollbar -mx-5 px-5 md:-mx-8 md:px-8 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Søg på navn eller varenummer…"
              className="flex-1 min-w-[160px] bg-carbon border border-line rounded-full px-4 py-2.5 text-sm text-white placeholder:text-fog/60 focus:border-fog outline-none"
            />
            <div className="flex items-center gap-2 text-sm shrink-0">
              <span className="text-fog hidden sm:inline">Sortér:</span>
              {([['pop', 'Populært'], ['new', 'Nyeste'], ['low', 'Pris ↑'], ['high', 'Pris ↓']] as [Sort, string][]).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setSort(k)}
                  className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full border transition-colors ${
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

      <div className="text-fog text-sm mb-6">{filtered.length} produkter</div>

      {filtered.length === 0 ? (
        <div className="text-fog py-20 text-center">Ingen produkter matcher. Prøv en anden kategori.</div>
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
