import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { FocusCard, FocusStatus } from '@/lib/focus';

/** One focus product as a card: photo (or the cut-out on a dark ground), the
 *  month, the name, the teaser and the category. Used by the /focus-on
 *  overview grid and the "More focus products" strip. Server-safe (no hooks). */
export default function FocusCardView({
  card,
  href,
  status,
  monthLabel,
  labels,
  compact = false,
  priority = false,
}: {
  card: FocusCard;
  href: string;
  status?: FocusStatus;
  monthLabel: string;
  labels: { current: string; upcoming: string };
  compact?: boolean;
  priority?: boolean;
}) {
  const badge = status === 'current' ? labels.current : status === 'upcoming' ? labels.upcoming : '';
  const photo = card.image;
  const cut = !photo ? card.cutout : null;
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-carbon transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-stroxx-blue/60 focus-visible:-translate-y-0.5 focus-visible:border-stroxx-blue"
    >
      <div className={`relative overflow-hidden ${compact ? 'aspect-[16/10]' : 'aspect-[3/2]'} bg-steel`}>
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photo}
            alt={card.imageAlt || card.title}
            loading={priority ? 'eager' : 'lazy'}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : cut ? (
          <>
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(55% 60% at 50% 55%, rgba(0,136,194,0.22), transparent 72%)' }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cut}
              alt={card.imageAlt || card.title}
              loading={priority ? 'eager' : 'lazy'}
              draggable={false}
              className="absolute inset-[10%] h-[80%] w-[80%] object-contain transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-fog/40 text-xs uppercase tracking-wider">STROXX</div>
        )}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,12,14,0) 55%, rgba(11,12,14,0.55) 100%)' }} />
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${
              status === 'current' ? 'bg-stroxx-blue text-white' : 'border border-white/25 bg-ink/70 text-white'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className={`flex flex-1 flex-col ${compact ? 'p-4' : 'p-5 md:p-6'}`}>
        {monthLabel && <div className="mb-2 text-[11px] uppercase tracking-wider text-fog">{monthLabel}</div>}
        <h3 className={`font-medium leading-snug text-white ${compact ? 'text-base' : 'text-lg md:text-xl'}`}>{card.title}</h3>
        {!compact && card.teaser && <p className="mt-2 text-sm leading-relaxed text-fog">{card.teaser}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {card.category?.title ? (
            <span className="rounded-full border border-white/12 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-fog">{card.category.title}</span>
          ) : (
            <span />
          )}
          <ArrowUpRight size={18} className="shrink-0 text-fog transition-colors group-hover:text-stroxx-blueGlow" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
