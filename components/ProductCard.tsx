import Link from 'next/link';
import { Product, toolTexture, categoryBySlug, categoryBuyUrl } from '@/lib/data';

const badgeStyle: Record<string, string> = {
  'POPULÆR': 'bg-stroxx-blue text-white',
  'BLÅ PRIS': 'bg-stroxx-blue text-white',
  'KAMPAGNE': 'bg-stroxx-red text-white',
  'BEST I TEST': 'bg-white text-ink',
  'NYHED': 'bg-stroxx-blue text-white',
};

export default function ProductCard({ product }: { product: Product }) {
  const cat = categoryBySlug(product.category);
  const buyUrl = cat ? categoryBuyUrl(cat.path) : '#';
  return (
    <div className="relative group">
      {/* drifting blue light beneath the card */}
      <div className="pointer-events-none absolute -inset-6 -z-10 overflow-hidden">
        <div className="absolute left-1/2 bottom-2 h-44 w-3/4 -translate-x-1/2 rounded-full bg-stroxx-blue/30 blur-3xl blue-drift" />
      </div>

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

        {/* lit, floating product cut-out */}
        <Link href={`/produkt/${product.slug}`} className="relative block aspect-[5/4] grid place-items-center overflow-hidden">
          <div className="absolute inset-8 rounded-full" style={{ background: 'radial-gradient(circle, rgba(244,246,248,0.95), rgba(244,246,248,0) 68%)' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={toolTexture(product.imgId)}
            alt={product.name}
            loading="lazy"
            className="relative z-10 max-h-[74%] max-w-[78%] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.4)] group-hover:scale-[1.06] transition-transform duration-500"
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
              className="flex-1 text-center text-xs font-semibold bg-stroxx-blue text-white rounded-md py-2.5 hover:bg-[#006aa8] transition-colors">
              Køb hos Carl Ras
            </a>
            <Link href={`/produkt/${product.slug}`}
              className="flex-1 text-center text-xs font-semibold border border-white/15 text-white rounded-md py-2.5 hover:border-white/40 hover:bg-white/5 transition-colors">
              Udforsk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
