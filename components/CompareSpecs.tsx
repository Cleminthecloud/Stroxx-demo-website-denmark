import Link from 'next/link';
import GlassButton from '@/components/GlassButton';
import { toolTexture, productBuyUrl, type Product } from '@/lib/data';

/** Side-by-side spec comparison on product pages, the feature every pro
 *  expects from the big tool brands: the current product against up to two
 *  siblings from the same category. Fully automatic from the product feed
 *  (PIM), zero editor work, and it quietly cross-sells. Renders nothing when
 *  there is nothing comparable. */

export default function CompareSpecs({ product, others }: { product: Product; others: Product[] }) {
  const candidates = others.filter((o) => o.code !== product.code && o.specs?.length).slice(0, 2);
  if (!product.specs?.length || candidates.length === 0) return null;
  const columns = [product, ...candidates];

  /* union of spec labels, ordered by the current product's sheet first */
  const labels: string[] = [];
  for (const p of columns)
    for (const s of p.specs) if (!labels.includes(s.label)) labels.push(s.label);
  const value = (p: Product, label: string) => p.specs.find((s) => s.label === label)?.value ?? '–';

  return (
    <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-20">
      <div className="eyebrow mb-3">Compare</div>
      <h2 className="h-display text-white text-[clamp(1.8rem,4vw,3rem)] leading-[0.95] mb-10">
        How it stacks up.
      </h2>

      <div data-lenis-prevent className="overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className="text-left align-bottom pb-5 pr-4 w-[180px]">
                <span className="text-fog/60 text-xs uppercase tracking-wider font-medium">Specification</span>
              </th>
              {columns.map((p, i) => (
                <th scope="col" key={p.code} className="text-left align-bottom pb-5 px-4 min-w-[190px]">
                  <div className="relative h-24 w-24 mb-3 grid place-items-center">
                    <span className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,136,194,0.16), rgba(0,136,194,0) 70%)' }} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={toolTexture(p.imgId)} alt={p.name} loading="lazy" className="relative z-10 h-20 w-20 object-contain" />
                  </div>
                  <Link href={`/produkt/${p.slug}`}
                    className={`block text-[14px] font-medium leading-snug line-clamp-2 transition-colors ${i === 0 ? 'text-stroxx-blue' : 'text-white hover:text-stroxx-blue'}`}>
                    {p.name}
                  </Link>
                  {i === 0 && <span className="mt-1 inline-block text-[10px] uppercase tracking-wider text-fog/60">This product</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label) => (
              <tr key={label}>
                <th scope="row" className="py-3 pr-4 text-left font-normal text-fog text-sm border-t border-white/[0.07]">{label}</th>
                {columns.map((p, i) => (
                  <td key={p.code} className={`py-3 px-4 text-sm border-t border-white/[0.07] ${i === 0 ? 'text-white' : 'text-fog'}`}>
                    {value(p, label)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="pt-6 border-t border-white/[0.07]" />
              {columns.map((p) => (
                <td key={p.code} className="pt-6 px-4 border-t border-white/[0.07]">
                  <GlassButton href={productBuyUrl(p.code)} external size="sm">Buy</GlassButton>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
