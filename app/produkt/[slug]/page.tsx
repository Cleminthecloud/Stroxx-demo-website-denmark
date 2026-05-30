import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ProClubSignup from '@/components/ProClubSignup';
import {
  products,
  productBySlug,
  categoryBySlug,
  crImage,
  categoryBuyUrl,
  brandImages,
} from '@/lib/data';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = productBySlug(params.slug);
  return { title: p ? `${p.name} — STROXX` : 'STROXX' };
}

const badgeStyle: Record<string, string> = {
  'POPULÆR': 'bg-stroxx-blue text-white',
  'BLÅ PRIS': 'bg-stroxx-blue text-white',
  'KAMPAGNE': 'bg-stroxx-blue text-white',
  'BEST I TEST': 'bg-white text-ink',
  'NYHED': 'bg-stroxx-blue text-white',
};

export default function FocusProduct({ params }: { params: { slug: string } }) {
  const product = productBySlug(params.slug);
  if (!product) notFound();

  const cat = categoryBySlug(product.category);
  const buyUrl = cat ? categoryBuyUrl(cat.path) : '#';
  const related = products
    .filter((p) => p.slug !== product.slug && p.tags.some((t) => product.tags.includes(t)))
    .slice(0, 4);

  return (
    <main className="bg-ink">
      {/* ——— Hero ——— */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 pt-28 md:pt-32 pb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="aspect-[5/4] rounded-sm bg-paper flex items-center justify-center p-12 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={crImage(product.imgId)} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
            </div>
            {product.badges.length > 0 && (
              <div className="absolute top-4 left-4 flex gap-1.5">
                {product.badges.map((b) => (
                  <span key={b} className={`text-[11px] font-semibold px-2.5 py-1 rounded-sm ${badgeStyle[b] ?? 'bg-steel text-white'}`}>{b}</span>
                ))}
              </div>
            )}
          </div>

          <div>
            <nav className="text-fog text-sm mb-5 flex items-center gap-2">
              <Link href="/produkter" className="hover:text-white">Produkter</Link>
              <span>/</span>
              {cat && <Link href={`/produkter?cat=${cat.slug}`} className="hover:text-white">{cat.name}</Link>}
            </nav>
            <div className="eyebrow mb-3">STROXX · {cat?.name}</div>
            <h1 className="h-display text-[clamp(2rem,4.5vw,3.6rem)] text-white mb-4">{product.name}</h1>
            <p className="text-fog text-lg leading-relaxed mb-7 max-w-xl">{product.blurb}</p>

            <div className="flex items-end gap-8 mb-8">
              <div>
                <div className="font-display font-extrabold text-4xl text-white">{product.price}</div>
                <div className="text-fog text-sm">DKK inkl. moms / {product.unit}</div>
              </div>
              {product.code && (
                <div className="text-fog text-sm pb-1">Kode <span className="text-white">{product.code}</span></div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="btn-blue">Køb hos Carl Ras</a>
              <Link href="/produkter" className="btn-ghost">Tilbage til oversigt</Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-fog">
              <span className="h-2 w-2 rounded-full bg-green-500" /> 100% tilfredshedsgaranti · købet sker hos Carl Ras
            </div>
          </div>
        </div>
      </section>

      {/* ——— Why STROXX + In use ——— */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-20 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <div className="eyebrow mb-4">Hvorfor det er STROXX</div>
            <h2 className="h-display text-[clamp(1.8rem,3.5vw,2.8rem)] text-white mb-5">
              Samme følelse. Langt fra samme pris.
            </h2>
            <p className="text-fog text-lg leading-relaxed mb-6">
              Der er kælet for detaljerne — med fokus på funktion, form, pålidelighed og effektivitet.
              Fordi vi udvikler og udvælger kvaliteten sammen med vores europæiske partnere, kan vi
              tilbyde overraskende meget værdi for pengene.
            </p>
            <blockquote className="border-l-2 border-stroxx-blue pl-5 text-white/90 italic">
              «Jeg anbefaler den til kunder hver uge. Den gør arbejdet — og folk bliver overraskede over
              prisen.»
              <footer className="text-fog text-sm not-italic mt-2">— Niels Storm, Sourcing Manager</footer>
            </blockquote>
          </div>
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brandImages.square03} alt="STROXX i brug på pladsen" className="h-full w-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-ink/80 backdrop-blur px-3 py-1.5 rounded-sm text-xs text-white">
              I brug · dansk byggeplads
            </div>
          </div>
        </div>
      </section>

      {/* ——— Specs ——— */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-20 grid gap-12 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="eyebrow mb-6">Specifikationer</div>
            <div className="border border-line rounded-sm overflow-hidden">
              {product.specs.length > 0 ? (
                product.specs.map((s, i) => (
                  <div key={s.label} className={`flex justify-between px-5 py-3.5 text-sm ${i % 2 ? 'bg-carbon' : 'bg-ink'}`}>
                    <span className="text-fog">{s.label}</span>
                    <span className="text-white font-medium">{s.value}</span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-4 text-fog text-sm bg-carbon">Specifikationer følger.</div>
              )}
            </div>
            <p className="text-fog/60 text-xs mt-3">
              Fuldt datablad og varianter synkroniseres fra Carl Ras PIM i den endelige løsning.
            </p>
          </div>
          <ProClubSignup />
        </div>
      </section>

      {/* ——— Related ——— */}
      {related.length > 0 && (
        <section>
          <div className="mx-auto max-w-[1400px] px-5 md:px-8 py-20">
            <h2 className="h-display text-[clamp(1.6rem,3vw,2.4rem)] text-white mb-8">Relaterede STROXX-produkter</h2>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
