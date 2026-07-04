import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import GlassButton from '@/components/GlassButton';
import CarouselRow from '@/components/CarouselRow';
import { productsBySkus } from '@/lib/cms';
import { toolTexture, productBuyUrl } from '@/lib/data';

/** The in-article product slider: editors drop a "Product slider" block into
 *  the article body and type item numbers; the product feed (PIM) supplies
 *  names and specs, the image pipeline (DAM knockout) supplies the floating
 *  cut-outs. Horizontal scroll-snap, glass cards, no JS. Unknown SKUs are
 *  skipped, an empty list renders nothing: an editor typo can't break the
 *  reading flow. */

export default function ArticleProductSlider({ title, skus }: { title?: string; skus?: string[] }) {
  const items = productsBySkus(skus);
  if (!items.length) return null;
  return (
    <div className="my-12">
      <CarouselRow title={title}>
        {items.map((p) => (
          <div key={p.code} className="snap-start shrink-0 w-[240px] sm:w-[260px] group">
            <div className="relative h-full flex flex-col glass glass-card rounded-xl overflow-hidden">
              <Link href={`/produkt/${p.slug}`} className="relative block aspect-[5/4] grid place-items-center overflow-hidden">
                <div className="absolute inset-5 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,130,202,0.16), rgba(0,130,202,0) 70%)' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={toolTexture(p.imgId)}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  className="relative z-10 h-[74%] w-[78%] object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                />
              </Link>
              <div className="relative z-10 flex flex-col flex-1 p-4">
                <Link href={`/produkt/${p.slug}`}
                  className="text-[13px] font-medium text-white leading-snug line-clamp-2 min-h-[2.6em] mb-3 hover:text-stroxx-blue transition-colors">
                  {p.name}
                </Link>
                <div className="mt-auto">
                  <GlassButton href={productBuyUrl(p.code)} external size="sm" className="w-full justify-center">
                    Buy <ArrowUpRight size={13} />
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CarouselRow>
    </div>
  );
}
