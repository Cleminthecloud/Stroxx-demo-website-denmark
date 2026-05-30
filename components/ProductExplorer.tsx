'use client';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { products, categories, categoryBySlug, categoryBuyUrl } from '@/lib/data';

const parsePrice = (s: string) => parseFloat(s.replace(/\./g, '').replace(',', '.'));

type Sort = 'pop' | 'low' | 'high';

export default function ProductExplorer() {
  const params = useSearchParams();
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('pop');

  useEffect(() => {
    const c = params.get('cat');
    if (c) setActive(c);
  }, [params]);

  // categories that actually have products in this demo dataset
  const populated = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return categories.filter((c) => set.has(c.slug));
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const inCat = !active || p.tags.includes(active);
      const inQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
      return inCat && inQ;
    });
    if (sort === 'low') list = [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sort === 'high') list = [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    if (sort === 'pop') list = [...list].sort((a, b) => b.badges.length - a.badges.length);
    return list;
  }, [active, q, sort]);

  const activeCat = active ? categoryBySlug(active) : null;

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-8 pb-24">
      {/* header */}
      <div className="pt-28 md:pt-36 pb-10">
        <div className="eyebrow mb-4">Produkter</div>
        <h1 className="h-display text-[clamp(2.2rem,6vw,5rem)] text-white max-w-[16ch]">
          Find dit STROXX-værktøj
        </h1>
        <p className="mt-5 text-fog text-lg max-w-2xl">
          Filtrér i sortimentet og spring direkte til købet hos Carl Ras. Et udpluk af de
          1.400+ varenumre — købet sker altid på partnerens platform.
        </p>
      </div>

      {/* controls */}
      <div className="sticky top-16 z-30 -mx-5 md:-mx-8 px-5 md:px-8 py-4 bg-ink/85 backdrop-blur-md border-y border-line mb-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActive(null)}
              className={`text-sm px-3 py-1.5 rounded-sm border transition-colors ${
                !active ? 'bg-stroxx-blue border-stroxx-blue text-white' : 'border-line text-fog hover:text-white'
              }`}
            >
              Alle
            </button>
            {populated.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`text-sm px-3 py-1.5 rounded-sm border transition-colors ${
                  active === c.slug ? 'bg-stroxx-blue border-stroxx-blue text-white' : 'border-line text-fog hover:text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Søg i produkter…"
              className="flex-1 min-w-[200px] bg-carbon border border-line rounded-sm px-4 py-2.5 text-sm text-white placeholder:text-fog/60 focus:border-fog outline-none"
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-fog">Sortér:</span>
              {([['pop', 'Populært'], ['low', 'Pris ↑'], ['high', 'Pris ↓']] as [Sort, string][]).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setSort(k)}
                  className={`px-3 py-1.5 rounded-sm border transition-colors ${
                    sort === k ? 'border-white text-white' : 'border-line text-fog hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* active-category buy band */}
      {activeCat && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-carbon border border-line rounded-sm p-5">
          <div>
            <div className="text-white font-medium">{activeCat.name}</div>
            <div className="text-fog text-sm">{activeCat.blurb}</div>
          </div>
          <a href={categoryBuyUrl(activeCat.path)} target="_blank" rel="noopener noreferrer" className="btn-blue shrink-0">
            Se hele kategorien hos Carl Ras
          </a>
        </div>
      )}

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
