'use client';
import { useEffect, useRef, useState } from 'react';
import KnockoutImage from '@/components/KnockoutImage';
import CursorGlow from '@/components/CursorGlow';
import { ArrowRight } from 'lucide-react';
import { Product, toolTexture, crImage } from '@/lib/data';

const badgeStyle: Record<string, string> = {
  'POPULÆR': 'bg-stroxx-blue text-white',
  'BLÅ PRIS': 'bg-stroxx-blue text-white',
  'KAMPAGNE': 'bg-stroxx-red text-white',
  'BEST I TEST': 'bg-white text-ink',
  'NYHED': 'bg-stroxx-blue text-white',
  'OUTLET': 'bg-steel text-white',
  'MILJØ': 'bg-green-600 text-white',
};

/** Product hero with the bag-on-frontpage feel: a big knocked-out cut-out
 *  floating on blue light with a soft floor shadow, gentle scroll parallax.
 *  Details sit BESIDE the image for square/portrait shots, and BELOW it for
 *  wide ones — measured from the real image aspect ratio. */
export default function ProductHero({
  product,
  buyUrl,
  categoryName,
}: {
  product: Product;
  buyUrl: string;
  categoryName: string;
}) {
  const [wide, setWide] = useState(false);
  const floatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const im = new Image();
    im.onload = () => setWide(im.naturalWidth / im.naturalHeight > 1.32);
    im.src = crImage(product.imgId);
  }, [product.imgId]);

  useEffect(() => {
    const el = floatRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const loop = () => {
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight - r.top) / (window.innerHeight + r.height); // 0..1 through viewport
      el.style.transform = `translateY(${(p - 0.5) * -36}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const Details = (
    <div className={wide ? 'max-w-2xl mx-auto text-center' : ''}>
      <div className="eyebrow mb-4">STROXX · {categoryName}</div>
      <h1 className="h-display text-white text-[clamp(2rem,4.6vw,3.8rem)] leading-[0.98] mb-5">{product.name}</h1>
      {product.blurb && <p className="text-fog text-lg leading-relaxed mb-7 max-w-xl">{product.blurb}</p>}

      <div className={`flex items-end gap-8 mb-8 ${wide ? 'justify-center' : ''}`}>
        <div>
          <div className="h-display text-white text-4xl">{product.price}</div>
          <div className="text-fog text-sm mt-1">DKK inkl. moms / {product.unit}</div>
        </div>
        {product.code && (
          <div className="text-fog text-sm pb-1">Kode <span className="text-white">{product.code}</span></div>
        )}
      </div>

      <div className={`flex flex-wrap gap-3 mb-6 ${wide ? 'justify-center' : ''}`}>
        <a href={buyUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-stroxx-blue text-white text-sm font-semibold rounded-full px-6 py-3 hover:bg-[#006aa8] transition-colors">
          Køb hos Carl Ras <ArrowRight size={16} />
        </a>
        <a href="#specifikationer"
          className="inline-flex items-center text-sm font-semibold text-white rounded-full px-6 py-3 bg-white/[0.06] border border-white/10 backdrop-blur-sm hover:bg-white/[0.12] transition-colors">
          Tekniske specs
        </a>
      </div>
      <div className={`flex items-center gap-2 text-sm text-fog ${wide ? 'justify-center' : ''}`}>
        <span className="h-2 w-2 rounded-full bg-green-500" /> 100% tilfredsgaranti · købet sker hos Carl Ras
      </div>
    </div>
  );

  const Figure = (
    <div ref={floatRef} className="relative will-change-transform">
      {/* blue light pool behind the product */}
      <div className="pointer-events-none absolute inset-0 -z-10" style={{
        background: 'radial-gradient(46% 42% at 50% 46%, rgba(0,130,202,0.30), transparent 70%)',
      }} />
      {/* floor shadow */}
      <div className="pointer-events-none absolute left-1/2 bottom-[8%] h-10 w-3/5 -translate-x-1/2 rounded-[50%] bg-black/55 blur-2xl" />
      {product.badges.length > 0 && (
        <div className="absolute top-2 left-2 z-20 flex gap-1.5">
          {product.badges.slice(0, 3).map((b) => (
            <span key={b} className={`text-[11px] font-semibold px-2.5 py-1 rounded-sm ${badgeStyle[b] ?? 'bg-steel text-white'}`}>{b}</span>
          ))}
        </div>
      )}
      <KnockoutImage
        src={toolTexture(product.imgId)}
        alt={product.name}
        className={`relative z-10 w-full ${wide ? 'h-[44vh] min-h-[300px]' : 'h-[58vh] min-h-[380px]'}`}
      />
    </div>
  );

  return (
    <section className="relative overflow-hidden">
      <CursorGlow size="50% 50%" intensity={0.16} />
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10 pt-32 md:pt-40 pb-20">
        {wide ? (
          <div className="flex flex-col gap-12">
            {Figure}
            {Details}
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            {Figure}
            {Details}
          </div>
        )}
      </div>
    </section>
  );
}
