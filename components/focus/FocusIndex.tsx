'use client';
import { useCallback, useMemo, useState } from 'react';
import FocusCardView from '@/components/focus/FocusCardView';
import { filterFocus, focusFacets, type FocusCard, type FocusFilter, type FocusStatus } from '@/lib/focus';
import { focusCopy } from '@/lib/focus-copy';

/** The filterable /focus-on grid (the Webflow + Finsweet "fs-list" overview,
 *  rebuilt natively). Every card is server-rendered into the HTML, so search
 *  engines and no-JS visitors get the full list; the filter only hides cards.
 *  State lives in the URL (?category=lighting&topic=...&year=2026) so a
 *  filtered view can be shared, and Back/Forward behave. A filter group with
 *  fewer than two options is not shown at all. */
/** Fewest focus pages before the topic filter appears. */
export const TOPIC_MIN_PAGES = 6;

export default function FocusIndex({
  cards,
  statuses,
  monthLabels,
  hrefs,
  initial,
  htmlLang,
}: {
  cards: FocusCard[];
  statuses: Record<string, FocusStatus>;
  monthLabels: Record<string, string>;
  hrefs: Record<string, string>;
  initial: FocusFilter;
  htmlLang: string;
}) {
  const t = focusCopy(htmlLang);
  const facets = useMemo(() => focusFacets(cards), [cards]);
  const [filter, setFilter] = useState<FocusFilter>(initial);
  const shown = useMemo(() => filterFocus(cards, filter), [cards, filter]);

  const update = useCallback((next: FocusFilter) => {
    setFilter(next);
    try {
      const url = new URL(window.location.href);
      const set = (k: string, v?: string) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k));
      set('category', next.category);
      set('topic', next.tag);
      set('year', next.year);
      window.history.replaceState(window.history.state, '', url.toString());
    } catch {
      /* URL sync is a convenience; filtering still works */
    }
  }, []);

  const groups: { id: keyof FocusFilter; label: string; options: { value: string; label: string }[] }[] = [
    { id: 'category', label: t.category, options: facets.categories.map((c) => ({ value: c.key, label: c.title })) },
    { id: 'tag', label: t.topic, options: facets.tags.map((x) => ({ value: x, label: x })) },
    { id: 'year', label: t.year, options: facets.years.map((y) => ({ value: y, label: y })) },
  ];
  /* category shows from two categories; the topic filter waits until there
     are enough pages for it to narrow anything (six), like the hidden "Emne"
     group on the Webflow overview; years show once two years exist */
  const visibleGroups = groups.filter((g) => g.options.length > 1 && (g.id !== 'tag' || cards.length >= TOPIC_MIN_PAGES || Boolean(filter.tag)));
  const anyActive = Boolean(filter.category || filter.tag || filter.year);

  return (
    <div>
      {visibleGroups.length > 0 && (
        <div role="group" aria-label={t.filters} className="mb-10 flex flex-col gap-4 md:mb-12">
          {visibleGroups.map((g) => (
            <div key={g.id} className="flex flex-wrap items-center gap-2">
              <span className="mr-1 w-full text-[11px] uppercase tracking-wider text-fog sm:w-auto sm:min-w-[5.5rem]">{g.label}</span>
              {[{ value: '', label: t.all }, ...g.options].map((o) => {
                const active = (filter[g.id] || '') === o.value;
                return (
                  <button
                    key={o.value || 'all'}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ ...filter, [g.id]: o.value || undefined })}
                    className={`min-h-[40px] rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroxx-blueGlow ${
                      active
                        ? 'border-stroxx-blue bg-stroxx-blue/15 text-white'
                        : 'border-white/15 text-fog hover:border-white/35 hover:text-white'
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {t.count(shown.length)}
      </p>

      <ul className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => {
            const visible = shown.includes(c);
            return (
              <li key={c._id} hidden={!visible} className={visible ? 'focus-card-in' : undefined}>
                <FocusCardView
                  card={c}
                  href={hrefs[c._id]}
                  status={statuses[c._id]}
                  monthLabel={monthLabels[c._id] || ''}
                  labels={{ current: t.current, upcoming: t.upcoming }}
                  priority={i < 3}
                />
              </li>
            );
          })}
        </ul>
      {!shown.length && (
        <div className="rounded-2xl border border-line bg-carbon p-10 text-center">
          <p className="mb-5 text-fog">{t.empty}</p>
          {anyActive && (
            <button type="button" onClick={() => update({})} className="link-arrow text-sm">
              {t.emptyReset}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
