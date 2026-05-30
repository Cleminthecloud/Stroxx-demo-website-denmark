import Link from 'next/link';
import { notFound } from 'next/navigation';
import ParticleImage from '@/components/ParticleImage';
import CursorGlow from '@/components/CursorGlow';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import { ArrowRight } from 'lucide-react';
import {
  categories,
  categoryBySlug,
  productsInCategory,
  categoryBuyUrl,
  toolTexture,
} from '@/lib/data';

const withProducts = categories.filter((c) => productsInCategory(c.slug).length > 0);

export function generateStaticParams() {
  return withProducts.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const c = categoryBySlug(params.slug);
  return { title: c ? `${c.name} — STROXX` : 'STROXX' };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = categoryBySlug(params.slug);
  if (!cat) notFound();
  const items = productsInCategory(cat.slug);
  if (items.length === 0) notFound();
  const hero = items.find((p) => p.hero) ?? items[0];

  return (
    <main className="bg-ink">
      {/* ——— Particle hero ——— */}
      <section className="relative">
        <CursorGlow />
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 pt-36 md:pt-44 pb-24 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <div className="eyebrow mb-7">Kategori</div>
            <h1 className="h-display text-white text-[clamp(2.6rem,7vw,6rem)] leading-[0.9]">
              {cat.name}
            </h1>
            <p className="mt-7 max-w-md text-fog text-lg leading-relaxed">{cat.blurb}</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={categoryBuyUrl(cat.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-stroxx-blue text-white text-sm font-semibold rounded-full px-6 py-3 hover:bg-[#006aa8] transition-colors"
              >
                Se hele kategorien hos Carl Ras <ArrowRight size={16} />
              </a>
              <span className="text-fog text-sm">{items.length} udvalgte varenumre</span>
            </div>
          </div>

          <div className="relative">
            <ParticleImage src={toolTexture(hero.imgId)} className="h-[58vh] min-h-[360px] w-full" />
            <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center">
              <span className="text-[11px] uppercase tracking-[0.2em] text-fog">{hero.name}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Glass product grid ——— */}
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 pb-32">
          <Reveal className="mb-12 flex items-end justify-between gap-6">
            <h2 className="h-display text-white text-[clamp(1.6rem,3.4vw,2.8rem)] leading-tight">
              Udvalgt i {cat.name.toLowerCase()}
            </h2>
            <Link href="/produkter" className="hidden sm:inline-flex items-center gap-1.5 text-fog text-sm hover:text-white transition-colors shrink-0">
              Alle produkter <ArrowRight size={15} />
            </Link>
          </Reveal>
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            {items.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 4) * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
