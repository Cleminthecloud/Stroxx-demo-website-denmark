import Link from 'next/link';
import GlassButton from '@/components/GlassButton';
import GlassCardGlow from '@/components/GlassCardGlow';
import { Product, toolTexture } from '@/lib/data';
import BuyCTA from '@/components/BuyCTA';

// Carl Ras splash colours, matched to the real badges on carl-ras.dk
const badgeStyle: Record<string, string> = {
  'VALUE': 'bg-[#0072BC] text-white',
  'POPULAR': 'bg-[#002C5F] text-white',
  'CAMPAIGN': 'bg-[#EE7F00] text-white',
  'BEST IN TEST': 'bg-white text-ink',
  'NEW': 'bg-[#0072BC] text-white',
  'ECO': 'bg-[#4C9A2A] text-white',
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="relative group h-full">
      <GlassCardGlow className="relative h-full flex flex-col glass glass-card rounded-xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-1">
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
        <Link href={`/product/${product.slug}`} className="relative block aspect-[5/4] grid place-items-center overflow-hidden">
          <div className="absolute inset-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,136,194,0.16), rgba(0,136,194,0) 70%)' }} />
          {/* the /api/tool proxy knocks the white studio bg out SERVER-SIDE
              (sharp), so a plain lazy <img> is enough here — no client canvas
              work for 358 cards. KnockoutImage stays for the PDP hero only. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={toolTexture(product.imgId)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="relative z-10 h-[76%] w-[80%] object-contain group-hover:scale-[1.06] transition-transform duration-500 lg:drop-shadow-[0_14px_22px_rgba(0,0,0,0.5)]"
          />
        </Link>

        <div className="relative z-10 flex flex-col flex-1 p-5">
          <div className="text-[11px] uppercase tracking-wider text-fog mb-1">STROXX</div>
          {/* min-h reserves two title lines so 1-line names don't shrink the card */}
          <Link href={`/product/${product.slug}`} className="text-[15px] font-medium text-white leading-snug mb-4 line-clamp-2 min-h-[2.75em] hover:text-stroxx-blue transition-colors">
            {product.name}
          </Link>
          <div className="flex gap-2 mt-auto">
            <BuyCTA code={product.code} label="Buy" size="sm" className="flex-1" />
            <GlassButton href={`/product/${product.slug}`} variant="ghost" size="sm" className="flex-1">Explore</GlassButton>
          </div>
        </div>
      </GlassCardGlow>
    </div>
  );
}
