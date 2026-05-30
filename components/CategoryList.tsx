'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { categories, productsInCategory } from '@/lib/data';

export default function CategoryList() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left + 340}px`);
    el.style.setProperty('--my', `${e.clientY - r.top + 340}px`);
  };

  return (
    <div ref={ref} onMouseMove={onMove} className="spotlight relative grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
      {categories.map((c, i) => (
        <Link
          key={c.slug}
          href={productsInCategory(c.slug).length > 0 ? `/kategori/${c.slug}` : `/produkter?cat=${c.slug}`}
          className="group relative z-10 flex items-center gap-4 py-4 border-b border-white/[0.06]"
        >
          <span className="text-fog/40 text-xs tabular-nums w-7 group-hover:text-stroxx-blue transition-colors">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="h-display text-2xl md:text-3xl text-white/85 transition-all duration-300 group-hover:text-white group-hover:translate-x-2">
            {c.name}
          </span>
          <span className="ml-auto text-stroxx-blue opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight size={22} strokeWidth={2} />
          </span>
        </Link>
      ))}
    </div>
  );
}
