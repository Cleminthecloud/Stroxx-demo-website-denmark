import { describe, expect, it } from 'vitest';
import { primaryHref } from '@/sanity/lib/docPageUrl';

/** Locks the empty-slug contract on primaryHref. The auto-redirect action
 *  (sanity/slugRedirectAction) builds its from/to paths from this function:
 *  when a slug-bearing document has NO slug, the answer must be null, never a
 *  bare prefix. A bare "/news/" once became a live redirect that hijacked the
 *  whole news index to a single article, and a legalPage would produce "/"
 *  and hijack the homepage. */

describe('primaryHref', () => {
  it('builds paths for slugged documents', () => {
    expect(primaryHref('post', { slug: { current: 'my-article' } })).toBe('/news/my-article');
    expect(primaryHref('supportPage', { slug: { current: 'mmexo' } })).toBe('/support/mmexo');
    expect(primaryHref('trade', { slug: { current: 'carpenter' } })).toBe('/trades/carpenter');
    expect(primaryHref('legalPage', { slug: 'privacy' })).toBe('/privacy');
    expect(primaryHref('landingPage', { slug: { current: 'try-it' } })).toBe('/try-it');
    expect(primaryHref('landingPage', { slug: { current: 'summer' } })).toBe('/campaign/summer');
  });

  it('returns null for slug-bearing types without a slug (never a bare prefix)', () => {
    for (const type of ['post', 'supportPage', 'trade', 'legalPage', 'landingPage']) {
      expect(primaryHref(type, {})).toBeNull();
      expect(primaryHref(type, { slug: { current: '' } })).toBeNull();
      expect(primaryHref(type, null)).toBeNull();
    }
  });

  it('keeps the fixed-path types working without a slug', () => {
    expect(primaryHref('homePage', {})).toBe('/');
    expect(primaryHref('monthlyLineup', {})).toBe('/monthly');
    expect(primaryHref('store', {})).toBe('/stores');
  });
});
