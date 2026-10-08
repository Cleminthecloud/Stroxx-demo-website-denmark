import { describe, expect, it } from 'vitest';
import {
  advisorResult,
  fillTemplate,
  filterFocus,
  focusFacets,
  focusStatuses,
  formatFocusMonth,
  isForeignDealerUrl,
  localizeHref,
  moreFocus,
  parseFocusFilter,
  safeHref,
  sortFocus,
  type FocusCard,
} from '@/lib/focus';
import { kelvinColour } from '@/components/focus/FocusBlocks';

const card = (p: Partial<FocusCard> & { _id: string }): FocusCard => ({ slug: p._id, title: p._id, ...p });

const LED = card({ _id: 'led', month: '2026-10-01', category: { key: 'lighting', title: 'Belysning' }, tags: ['arbejdslys'] });
const ST3 = card({ _id: 'st3', month: '2026-11-01', category: { key: 'security', title: 'Sikring' }, tags: ['adgang'] });
const OLD = card({ _id: 'old', month: '2025-09-01', category: { key: 'lighting', title: 'Belysning' } });
const NODATE = card({ _id: 'nodate' });

describe('focus ordering and badges', () => {
  it('sorts newest month first, undated last', () => {
    expect(sortFocus([OLD, NODATE, LED, ST3]).map((c) => c._id)).toEqual(['st3', 'led', 'old', 'nodate']);
  });

  it('marks the newest STARTED month current, later months upcoming', () => {
    const st = focusStatuses([OLD, LED, ST3], '2026-10-08');
    expect(st.get('led')).toBe('current');
    expect(st.get('st3')).toBe('upcoming');
    expect(st.get('old')).toBe('past');
  });

  it('moves the current badge on the first of the month', () => {
    expect(focusStatuses([LED, ST3], '2026-11-01').get('st3')).toBe('current');
    expect(focusStatuses([LED, ST3], '2026-11-01').get('led')).toBe('past');
  });

  it('has no current page when nothing has started yet', () => {
    const st = focusStatuses([ST3], '2026-01-01');
    expect([...st.values()]).toEqual(['upcoming']);
  });
});

describe('focus filters', () => {
  const all = [LED, ST3, OLD];
  it('filters by category key, tag and year', () => {
    expect(filterFocus(all, { category: 'lighting' }).map((c) => c._id)).toEqual(['led', 'old']);
    expect(filterFocus(all, { tag: 'adgang' }).map((c) => c._id)).toEqual(['st3']);
    expect(filterFocus(all, { year: '2025' }).map((c) => c._id)).toEqual(['old']);
    expect(filterFocus(all, {})).toHaveLength(3);
  });

  it('lists facets in use, categories by title, years newest first', () => {
    const f = focusFacets(all);
    expect(f.categories.map((c) => c.key)).toEqual(['lighting', 'security']);
    expect(f.years).toEqual(['2026', '2025']);
    expect(f.tags).toEqual(['adgang', 'arbejdslys']);
  });

  it('ignores unknown or forged filter values from the URL', () => {
    const f = focusFacets(all);
    const params = new URLSearchParams('category=%3Cscript%3E&topic=adgang&year=1999');
    expect(parseFocusFilter(params, f)).toEqual({ category: undefined, tag: 'adgang', year: undefined });
  });
});

describe('more focus strip', () => {
  it('never lists the page you are on, newest first, capped', () => {
    expect(moreFocus([OLD, LED, ST3], 'led', 7).map((c) => c._id)).toEqual(['st3', 'old']);
    expect(moreFocus([OLD, LED, ST3], 'x', 2)).toHaveLength(2);
  });
});

describe('month labels', () => {
  it('formats in the page language', () => {
    expect(formatFocusMonth('2026-10-01', 'da').toLowerCase()).toContain('oktober');
    expect(formatFocusMonth('2026-10-01', 'en')).toContain('October');
    expect(formatFocusMonth(undefined, 'en')).toBe('');
    expect(formatFocusMonth('nonsense', 'en')).toBe('');
  });
});

describe('range advisor (door thickness → spindle)', () => {
  /* the Webflow ST-3 rule: up to 50 mm → 70, then +10 mm spindle per 10 mm door */
  const bands = [50, 60, 70, 80, 90, 100].map((u, i) => ({ upTo: u, result: String(70 + i * 10) }));
  it.each([
    [40, '70'],
    [50, '70'],
    [51, '80'],
    [55, '80'],
    [60, '80'],
    [61, '90'],
    [99, '120'],
    [100, '120'],
  ])('%i mm door → %s mm spindle', (t, r) => {
    expect(advisorResult(t, bands)?.result).toBe(r);
  });
  it('accepts bands in any order and clamps past the last band', () => {
    expect(advisorResult(55, [...bands].reverse())?.result).toBe('80');
    expect(advisorResult(130, bands)?.result).toBe('120');
    expect(advisorResult(10, [])).toBeNull();
  });
  it('fills the sentence template', () => {
    expect(fillTemplate('Brug grebspind 8x8x{result} mm ({value} mm dør)', 55, '80')).toBe('Brug grebspind 8x8x80 mm (55 mm dør)');
  });
});

describe('buy contract on focus pages', () => {
  it('flags a Carl Ras link outside Denmark only', () => {
    const cr = 'https://www.carl-ras.dk/led-strip-kabeltromle-1500-l/?product=55011717/55011718';
    expect(isForeignDealerUrl(cr, 'dk')).toBe(false);
    expect(isForeignDealerUrl(cr, 'int')).toBe(true);
    expect(isForeignDealerUrl(cr, 'de')).toBe(true);
    expect(isForeignDealerUrl('https://dam-carl-ras-dk.azureedge.net/x', 'int')).toBe(false);
    expect(isForeignDealerUrl('/satisfaction-guarantee', 'int')).toBe(false);
  });
});

describe('links from the CMS', () => {
  it('drops dangerous schemes', () => {
    expect(safeHref('javascript:alert(1)')).toBe('');
    expect(safeHref('data:text/html,x')).toBe('');
    expect(safeHref('//evil.example')).toBe('');
    expect(safeHref(' https://www.stroxx.eu ')).toBe('https://www.stroxx.eu');
    expect(safeHref('mailto:a@b.dk')).toBe('mailto:a@b.dk');
    expect(safeHref('/focus-on')).toBe('/focus-on');
  });
  it('keeps internal links in the visitor market', () => {
    expect(localizeHref('/focus-on', '/dk')).toBe('/dk/focus-on');
    expect(localizeHref('/dk/focus-on', '/dk')).toBe('/dk/focus-on');
    expect(localizeHref('/', '/dk')).toBe('/dk');
    expect(localizeHref('/focus-on', '')).toBe('/focus-on');
    expect(localizeHref('https://x.dk/a', '/dk')).toBe('https://x.dk/a');
  });
});

describe('kelvin swatches', () => {
  it('warm is redder than cool', () => {
    const warm = kelvinColour(3000).match(/\d+/g)!.map(Number);
    const cool = kelvinColour(6500).match(/\d+/g)!.map(Number);
    expect(warm[2]).toBeLessThan(cool[2]);
    expect(warm[0]).toBe(255);
  });
});
