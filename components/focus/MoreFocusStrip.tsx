import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import FocusCardView from '@/components/focus/FocusCardView';
import { focusStatuses, formatFocusMonth, localizeHref, moreFocus, type FocusCard } from '@/lib/focus';
import { focusCopy } from '@/lib/focus-copy';

/** "More focus products" at the foot of every focus page. Automatic, unlike
 *  the Webflow version that had to be copied onto each page by hand: the
 *  newest seven, never the page you are on. A horizontal, snapping row on
 *  desktop and tablet, a compact vertical list (max four) on phones. */
export default function MoreFocusStrip({
  cards,
  currentSlug,
  prefix,
  htmlLang,
}: {
  cards: FocusCard[];
  currentSlug: string;
  prefix: string;
  htmlLang: string;
}) {
  const list = moreFocus(cards, currentSlug, 7);
  if (!list.length) return null;
  const t = focusCopy(htmlLang);
  const statuses = focusStatuses(cards, new Date().toISOString().slice(0, 10));
  const allHref = localizeHref('/focus-on', prefix);
  return (
    <section aria-labelledby="more-focus-h" className="relative border-t border-line">
      <div className="mx-auto max-w-[1600px] px-6 py-20 md:px-10 md:py-24">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="eyebrow mb-3">{t.section}</div>
            <h2 id="more-focus-h" className="h-display text-[clamp(1.8rem,3.6vw,2.8rem)] leading-[0.98] text-white">
              {t.more}
            </h2>
          </div>
          <Link href={allHref} className="link-arrow shrink-0 text-sm">
            {t.seeAll} <ArrowRight size={14} />
          </Link>
        </div>

        {/* tablet + desktop: a snapping row of fixed-width cards */}
        <ul className="hidden list-none snap-x snap-mandatory gap-4 overflow-x-auto p-0 pb-4 md:flex [scrollbar-width:thin]">
          {list.map((c) => (
            <li key={c._id} className="w-[260px] shrink-0 snap-start">
              <FocusCardView
                card={c}
                href={localizeHref(`/focus-on/${c.slug}`, prefix)}
                status={statuses.get(c._id)}
                monthLabel={formatFocusMonth(c.month, htmlLang)}
                labels={{ current: t.current, upcoming: t.upcoming }}
                compact
              />
            </li>
          ))}
        </ul>

        {/* phones: compact rows, image left, text right */}
        <ul className="flex list-none flex-col gap-3 p-0 md:hidden">
          {list.slice(0, 4).map((c) => {
            const img = c.image || c.cutout;
            const st = statuses.get(c._id);
            return (
              <li key={c._id}>
                <Link
                  href={localizeHref(`/focus-on/${c.slug}`, prefix)}
                  className="flex items-center gap-4 rounded-xl border border-line bg-carbon p-3 transition-colors hover:border-stroxx-blue/60"
                >
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-steel">
                    {img && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={img} alt="" loading="lazy" className={`absolute inset-0 h-full w-full ${c.image ? 'object-cover' : 'object-contain p-1.5'}`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-fog">
                      {formatFocusMonth(c.month, htmlLang)}
                      {st === 'current' && <span className="rounded-full bg-stroxx-blue px-2 py-0.5 text-white">{t.current}</span>}
                    </div>
                    <div className="truncate font-medium text-white">{c.title}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
