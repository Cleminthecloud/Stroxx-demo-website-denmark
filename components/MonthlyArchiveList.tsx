'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, X } from 'lucide-react';
import { toolTexture } from '@/lib/data';
import type { LineupSummary } from '@/lib/cms';

/** The archive of every Månedens STROXX we have published.
 *
 *  Search runs in the browser over the months already on the page: an archive
 *  of a few dozen months is small enough that a round trip per keystroke would
 *  be slower and worse, and it keeps working with the CDN cache. The haystack
 *  is the month name, the year, the summary and every product name and item
 *  number in that month, so "laser", "35011932" and "July" all find it.
 *
 *  Each card links to the month's permanent address, /monthly/YYYY-MM. */
export default function MonthlyArchiveList({ months, currentPeriod }: { months: LineupSummary[]; currentPeriod?: string }) {
  const [q, setQ] = useState('');
  const [year, setYear] = useState<string>('all');

  const years = useMemo(() => Array.from(new Set(months.map((m) => m.year).filter(Boolean))).sort().reverse(), [months]);

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return months.filter((m) => {
      if (year !== 'all' && m.year !== year) return false;
      if (!needle) return true;
      const hay = [m.month, m.year, m.period, m.summary, m.heroName, ...m.skus].join(' ').toLowerCase();
      return needle.split(/\s+/).every((word) => hay.includes(word));
    });
  }, [months, q, year]);

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition-colors ${
      on ? 'border-stroxx-blue bg-stroxx-blue/15 text-white' : 'border-white/15 text-fog hover:border-white/35 hover:text-white'
    }`;

  return (
    <div>
      {/* search + year filter */}
      <div className="mb-10 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[16rem] flex-1 max-w-md">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fog" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a month, a tool or an item number"
            aria-label="Search the archive"
            className="w-full rounded-full border border-white/15 bg-white/[0.04] py-3 pl-11 pr-10 text-sm text-white placeholder:text-fog focus:border-stroxx-blue focus:outline-none"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-fog hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>
        {years.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip(year === 'all')} onClick={() => setYear('all')} aria-pressed={year === 'all'}>
              All years
            </button>
            {years.map((y) => (
              <button key={y} type="button" className={chip(year === y)} onClick={() => setYear(y)} aria-pressed={year === y}>
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mb-6 text-sm text-fog" aria-live="polite">
        {hits.length} {hits.length === 1 ? 'month' : 'months'}
        {q.trim() ? ` matching “${q.trim()}”` : ''}
      </p>

      {hits.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-fog">
          Nothing matches that. Try a tool name, an item number, or a month.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hits.map((m) => {
            const isCurrent = !!currentPeriod && m.period === currentPeriod;
            return (
              <li key={m.period}>
                <Link
                  href={isCurrent ? '/monthly' : `/monthly/${m.period}`}
                  className="group flex h-full items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.06]"
                >
                  {m.heroImgId && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={toolTexture(m.heroImgId)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-20 shrink-0 object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-stroxx-blue">
                        {m.month || m.period} {m.year}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full border border-green-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-green-400">
                          This month
                        </span>
                      )}
                    </div>
                    <div className="text-white leading-snug">{m.heroName || m.summary}</div>
                    {m.summary && m.summary !== m.heroName && (
                      <p className="mt-1 line-clamp-2 text-sm text-fog">{m.summary}</p>
                    )}
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-stroxx-blue transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
