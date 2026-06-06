import { Star } from 'lucide-react';
import Reveal from '@/components/Reveal';
import type { Testimonial } from '@/lib/testimonials';

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${n} ud af 5 stjerner`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < n ? 'fill-stroxx-blue text-stroxx-blue' : 'text-line'} />
      ))}
    </div>
  );
}

/** Testimonial wall in the site's glass style. Pure presentation — the matching
 *  Review/AggregateRating JSON-LD is emitted server-side by the page that uses
 *  this (keep the two in sync). */
export default function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((t, i) => (
        <Reveal key={t.name + t.quote.slice(0, 12)} delay={(i % 3) * 80}>
          <figure className="glass glass-card flex h-full flex-col rounded-xl p-6">
            <Stars n={t.rating} />
            <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-white/90">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 border-t border-line pt-4">
              <div className="text-sm font-medium text-white">{t.name}</div>
              <div className="text-xs text-fog">{t.role}</div>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
