import Link from 'next/link';
import KnockoutImage from '@/components/KnockoutImage';
import { Product, toolTexture, categoryBySlug, categoryBuyUrl } from '@/lib/data';

const badgeStyle: Record<string, string> = {
  'POPULÆR': 'bg-stroxx-blue text-white',
  'BLÅ PRIS': 'bg-stroxx-blue text-white',
  'KAMPAGNE': 'bg-stroxx-red text-white',
  'BEST I TEST': 'bg-white text-ink',
  'NYHED': 'bg-stroxx-blue text-white',
  'OUTLET': 'bg-steel text-white',
  'MILJØ': 'bg-green-600 text-white',
};

export default function ProductCard({ product }: { product: Product }) {
  const cat = categoryBySlug(product.category);
  const buyUrl = cat ? categoryBuyUrl(cat.path) : '#';
  return (
    <div className="relative group">
      <div className="glass rounded-xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-1">
        {product.badges.length > 0 && (
          <div className="absolute top-3 left-3 z-20 flex gap-1.5">
            {product.badges.slice(0, 2).map((b) => (
              <span key={b} className={`text-[10px] font-semibold tracking-wide px-2 py-1 rounded-sm ${badgeStyle[b] ?? 'bg-steel text-white'}`}>
                {b}
              </span>
            ))}
          </div>
        )}

        {/* lit, floating product cut-out — white background knocked out */}
        <Link href={`/produkt/${product.slug}`} className="relative block aspect-[5/4] grid place-items-center overflow-hidden">
          <div className="absolute inset-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,130,202,0.16), rgba(0,130,202,0) 70%)' }} />
          <KnockoutImage
            src={toolTexture(product.imgId)}
            alt={product.name}
            className="relative z-10 h-[76%] w-[80%] group-hover:scale-[1.06] transition-transform duration-500"
          />
        </Link>

        <div className="relative z-10 flex flex-col p-5">
          <div className="text-[11px] uppercase tracking-wider text-fog mb-1">STROXX</div>
          <Link href={`/produkt/${product.slug}`} className="text-[15px] font-medium text-white leading-snug mb-4 line-clamp-2 hover:text-stroxx-blue transition-colors">
            {product.name}
          </Link>
          <div className="mb-4">
            <span className="h-display text-xl text-white">{product.price}</span>
            <span className="text-[10px] text-fog ml-1.5">DKK / {product.unit}</span>
          </div>
          <div className="flex gap-2">
            <a href={buyUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center text-xs font-semibold text-white rounded-full py-2.5 transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02)), rgba(0,130,202,0.9)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 14px rgba(0,130,202,0.32)',
              }}>
              Køb hos Carl Ras
            </a>
            <Link href={`/produkt/${product.slug}`}
              className="flex-1 text-center text-xs font-semibold text-white rounded-full py-2.5 border border-white/10 hover:border-white/25 transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 3px 12px rgba(0,0,0,0.3)',
              }}>
              Udforsk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
