/** "Focus on…" (Fokus på…): the monthly focus-product pages.
 *
 *  Pure helpers only (no React, no Sanity client, no next/headers) so the
 *  overview's ordering, badges and filters, the door/spindle advisor maths and
 *  the dealer-link guard are unit-testable (tests/focus.test.ts) and can run on
 *  the server and in the browser alike. */

export type FocusCategory = { key: string; title: string };

/** One card on the /focus-on overview and in the "More focus products" strip. */
export type FocusCard = {
  _id: string;
  slug: string;
  title: string;
  teaser?: string;
  /** first day of the focus month, YYYY-MM-DD */
  month?: string;
  category?: FocusCategory | null;
  tags?: string[];
  /** product cut-out (transparent) and/or a hero photo; the card prefers the photo */
  image?: string | null;
  imageAlt?: string;
  cutout?: string | null;
};

export type FocusStatus = 'current' | 'upcoming' | 'past';

/** Newest first by focus month; undated pages sink to the end, then by title. */
export function sortFocus<T extends Pick<FocusCard, 'month' | 'title'>>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const am = a.month || '';
    const bm = b.month || '';
    if (am !== bm) return am < bm ? 1 : -1;
    return (a.title || '').localeCompare(b.title || '');
  });
}

/** The "current" page is the newest one whose month has started. Pages dated
 *  in a later month are "upcoming" (shown with a Coming badge), the rest are
 *  "past". With no started month at all nothing is current. */
export function focusStatuses(list: Pick<FocusCard, '_id' | 'month'>[], today: string): Map<string, FocusStatus> {
  const t = today.slice(0, 10);
  const started = list.filter((c) => c.month && c.month.slice(0, 10) <= t).sort((a, b) => ((a.month || '') < (b.month || '') ? 1 : -1));
  const currentId = started[0]?._id;
  const out = new Map<string, FocusStatus>();
  for (const c of list) {
    if (c._id === currentId) out.set(c._id, 'current');
    else if (c.month && c.month.slice(0, 10) > t) out.set(c._id, 'upcoming');
    else out.set(c._id, 'past');
  }
  return out;
}

export const focusYear = (month?: string): string => (month && /^\d{4}/.test(month) ? month.slice(0, 4) : '');

export type FocusFilter = { category?: string; tag?: string; year?: string };

/** Overview filter. Empty values mean "all". Matching is exact on the
 *  category KEY (shared across languages), the tag text and the year. */
export function filterFocus<T extends FocusCard>(list: T[], f: FocusFilter): T[] {
  return list.filter(
    (c) =>
      (!f.category || c.category?.key === f.category) &&
      (!f.tag || (c.tags || []).includes(f.tag)) &&
      (!f.year || focusYear(c.month) === f.year),
  );
}

/** Filter options actually in use, in display order (categories A to Z by
 *  title, tags A to Z, years newest first). A filter group with fewer than two
 *  options is pointless and the overview hides it. */
export function focusFacets(list: FocusCard[]): { categories: FocusCategory[]; tags: string[]; years: string[] } {
  const cats = new Map<string, FocusCategory>();
  const tags = new Set<string>();
  const years = new Set<string>();
  for (const c of list) {
    if (c.category?.key) cats.set(c.category.key, c.category);
    (c.tags || []).forEach((t) => t && tags.add(t));
    const y = focusYear(c.month);
    if (y) years.add(y);
  }
  return {
    categories: [...cats.values()].sort((a, b) => a.title.localeCompare(b.title)),
    tags: [...tags].sort((a, b) => a.localeCompare(b)),
    years: [...years].sort((a, b) => (a < b ? 1 : -1)),
  };
}

/** Read a filter from URL search params, keeping only values that exist, so a
 *  hand-edited or stale link can never produce an empty, broken page. */
export function parseFocusFilter(
  params: { get(name: string): string | null },
  facets: ReturnType<typeof focusFacets>,
): FocusFilter {
  const category = params.get('category') || '';
  const tag = params.get('topic') || '';
  const year = params.get('year') || '';
  return {
    category: facets.categories.some((c) => c.key === category) ? category : undefined,
    tag: facets.tags.includes(tag) ? tag : undefined,
    year: facets.years.includes(year) ? year : undefined,
  };
}

/** "October 2026" / "oktober 2026" in the page's language; empty on bad input. */
export function formatFocusMonth(month: string | undefined, htmlLang: string): string {
  if (!month || !/^\d{4}-\d{2}/.test(month)) return '';
  const [y, m] = month.split('-').map(Number);
  try {
    return new Intl.DateTimeFormat(htmlLang || 'en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)));
  } catch {
    return month.slice(0, 7);
  }
}

/** The "More focus products" strip: newest first, never the page you are on. */
export function moreFocus<T extends Pick<FocusCard, '_id' | 'slug' | 'month' | 'title'>>(list: T[], currentSlug: string, max = 7): T[] {
  return sortFocus(list.filter((c) => c.slug !== currentSlug)).slice(0, max);
}

/* ── Range advisor (e.g. door thickness → spindle length) ──────────────── */

export type AdvisorBand = { upTo: number; result: string };

/** The first band whose upper bound is at or above the value. Bands are
 *  sorted defensively, so editors may enter them in any order; values past the
 *  last band get the last band's result. */
export function advisorResult(value: number, bands: AdvisorBand[]): AdvisorBand | null {
  const sorted = [...(bands || [])].filter((b) => Number.isFinite(b?.upTo)).sort((a, b) => a.upTo - b.upTo);
  if (!sorted.length) return null;
  return sorted.find((b) => value <= b.upTo) ?? sorted[sorted.length - 1];
}

/** Replace {value} and {result} in an editor-written sentence. */
export function fillTemplate(tpl: string | undefined, value: number | string, result: string): string {
  return (tpl || '').replace(/\{value\}/g, String(value)).replace(/\{result\}/g, result);
}

/* ── Dealer links on focus pages ────────────────────────────────────────── */

const DEALER_HOSTS: Record<string, string[]> = {
  dk: ['carl-ras.dk'],
};

/** True when the URL points at a dealer webshop that belongs to a DIFFERENT
 *  market than the visitor's. The buy-layer contract (lib/buy.ts): a German or
 *  international visitor must never land on carl-ras.dk. Such links are
 *  replaced by the visitor's own dealer, or the dealer chooser. */
export function isForeignDealerUrl(href: string | undefined, marketCode: string | undefined): boolean {
  if (!href || !/^https?:/i.test(href)) return false;
  let host = '';
  try {
    host = new URL(href).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return false;
  }
  for (const [market, hosts] of Object.entries(DEALER_HOSTS)) {
    if (hosts.some((h) => host === h || host.endsWith('.' + h))) return market !== marketCode;
  }
  return false;
}

/** Internal path with the visitor's locale prefix (/dk on the shared domain,
 *  nothing on a country domain). External, mailto, tel and anchors pass as is. */
export function localizeHref(href: string | undefined, prefix: string): string {
  if (!href) return '';
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (!prefix) return href;
  if (href === prefix || href.startsWith(prefix + '/')) return href;
  return href === '/' ? prefix : prefix + href;
}

/** Only http(s), relative paths, anchors, mailto and tel are allowed as link
 *  targets from the CMS; anything else (javascript:, data:) is dropped. */
export function safeHref(href: string | undefined): string {
  const h = (href || '').trim();
  if (!h) return '';
  if (h.startsWith('/') || h.startsWith('#')) return h.startsWith('//') ? '' : h;
  return /^(https?:|mailto:|tel:)/i.test(h) ? h : '';
}
