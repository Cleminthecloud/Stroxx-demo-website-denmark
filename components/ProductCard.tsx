import Link from 'next/link';
import KnockoutImage from '@/components/KnockoutImage';
import GlassButton from '@/components/GlassButton';
import { Product, toolTexture, categoryBySlug, categoryBuyUrl } from '@/lib/data';

// Carl Ras splash colours — match the real badges on carl-ras.dk
const badgeStyle: Record<string, string> = {
  'BLÅ PRIS': 'bg-[#0072BC] text-white',
  'POPULÆR': 'bg-[#002C5F] text-white',
  'KAMPAGNE': 'bg-[#EE7F00] text-white',
  'BEST I TEST': 'bg-white text-ink',
  'NYHED': 'bg-[#0072BC] text-white',
  'OUTLET': 'bg-[#5A6473] text-white',
  'MILJØ': 'bg-[#4C9A2A] text-white',
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
            <GlassButton href={buyUrl} external size="sm" className="flex-1">Køb hos Carl Ras</GlassButton>
            <GlassButton href={`/produkt/${product.slug}`} variant="ghost" size="sm" className="flex-1">Udforsk</GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}
