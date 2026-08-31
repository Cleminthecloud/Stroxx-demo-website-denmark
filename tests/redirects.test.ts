import { describe, expect, it } from 'vitest';
import { legacyTarget, danishTarget, buildRedirectMap } from '@/lib/redirects';

/* Locks the legacy Shopify URL map (printed packaging QR codes depend on it)
 * and the CMS redirect validation (a bad document must never become an open
 * redirect). Extracted verbatim from proxy.ts into lib/redirects.ts. */

describe('legacyTarget', () => {
  it('maps the exact legacy store paths', () => {
    expect(legacyTarget('/pages/about')).toBe('/');
    expect(legacyTarget('/pages/contact')).toBe('/');
    expect(legacyTarget('/pages/categories')).toBe('/products');
    expect(legacyTarget('/collections/all')).toBe('/products');
    expect(legacyTarget('/cart')).toBe('/products');
    expect(legacyTarget('/account/login')).toBe('/');
  });

  it('keeps old support-page slugs alive under /support', () => {
    expect(legacyTarget('/pages/smart-locks-st2')).toBe('/support/smart-locks-st2');
    expect(legacyTarget('/pages/mmexo')).toBe('/support/mmexo');
  });

  it('support slug rewrite only accepts lowercase slug characters', () => {
    expect(legacyTarget('/pages/Smart-Locks')).toBeNull();
    expect(legacyTarget('/pages/slug/extra')).toBeNull();
    expect(legacyTarget('/pages/')).toBeNull();
  });

  it('old Shopify product and collection trees land on /products', () => {
    expect(legacyTarget('/products/some-old-product')).toBe('/products');
    expect(legacyTarget('/collections/tools')).toBe('/products');
    expect(legacyTarget('/collections')).toBe('/products');
  });

  it('bare /products is OUR products page — never a self-redirect loop', () => {
    expect(legacyTarget('/products')).toBeNull();
  });

  it('account and auth trees land on the front page', () => {
    expect(legacyTarget('/account')).toBe('/');
    expect(legacyTarget('/account/orders/123')).toBe('/');
    expect(legacyTarget('/customer_authentication/login')).toBe('/');
    expect(legacyTarget('/challenge')).toBe('/');
  });

  it('does not fire on lookalike prefixes', () => {
    expect(legacyTarget('/productsy')).toBeNull();
    expect(legacyTarget('/accounting')).toBeNull();
  });

  it('returns null for normal app paths, the root, and empty input', () => {
    expect(legacyTarget('/')).toBeNull();
    expect(legacyTarget('/products')).toBeNull();
    expect(legacyTarget('/support/mmexo')).toBeNull();
    expect(legacyTarget('/satisfaction-guarantee')).toBeNull();
    expect(legacyTarget('')).toBeNull();
  });
});

/* Locks the Danish→English slug sweep (2026-07-11): every pre-sweep Danish
 * URL must land on its English successor, permanently. */
describe('danishTarget', () => {
  it('maps the static Danish routes', () => {
    expect(danishTarget('/butikker')).toBe('/stores');
    expect(danishTarget('/fag')).toBe('/trades');
    expect(danishTarget('/maanedens')).toBe('/monthly');
    expect(danishTarget('/nyheder')).toBe('/news');
    expect(danishTarget('/produkter')).toBe('/products');
    expect(danishTarget('/privatliv')).toBe('/privacy');
    expect(danishTarget('/handelsbetingelser')).toBe('/terms');
    expect(danishTarget('/komponenter')).toBe('/components');
    expect(danishTarget('/proev-det')).toBe('/try-it');
  });

  it('carries dynamic product and news slugs over 1:1', () => {
    expect(danishTarget('/produkt/some-product-30012321')).toBe('/product/some-product-30012321');
    expect(danishTarget('/nyheder/which-laser-class-on-site')).toBe('/news/which-laser-class-on-site');
  });

  it('translates trade slugs', () => {
    expect(danishTarget('/fag/toemrer')).toBe('/trades/carpenter');
    expect(danishTarget('/fag/elektriker')).toBe('/trades/electrician');
    expect(danishTarget('/fag/vvs')).toBe('/trades/plumber');
    expect(danishTarget('/fag/maler')).toBe('/trades/painter');
    expect(danishTarget('/fag/murer')).toBe('/trades/bricklayer');
    expect(danishTarget('/fag/unknown-trade')).toBe('/trades');
  });

  it('translates category slugs and sends unknown ones to the finder', () => {
    expect(danishTarget('/kategori/bor-borsaet')).toBe('/category/drill-bits');
    expect(danishTarget('/kategori/tape')).toBe('/category/tape');
    expect(danishTarget('/kategori/whatever')).toBe('/products');
  });

  it('maps the campaign tree including the renamed proev-det page', () => {
    expect(danishTarget('/kampagne/proev-det')).toBe('/campaign/try-it');
    expect(danishTarget('/kampagne/summer-deal')).toBe('/campaign/summer-deal');
    expect(danishTarget('/kampagne')).toBe('/campaign');
  });

  it('maps the two product slugs that lost a Danish word', () => {
    expect(danishTarget('/produkt/hole-saw-adapter-set-5-pcs-for-hulsave-14-30mm-32012586'))
      .toBe('/product/hole-saw-adapter-set-5-pcs-for-hole-saws-14-30mm-32012586');
  });

  it('never fires on the new English routes', () => {
    expect(danishTarget('/stores')).toBeNull();
    expect(danishTarget('/trades/carpenter')).toBeNull();
    expect(danishTarget('/products')).toBeNull();
    expect(danishTarget('/satisfaction-guarantee')).toBeNull();
    expect(danishTarget('/')).toBeNull();
  });

  it('legacyTarget delegates to the Danish map first', () => {
    expect(legacyTarget('/butikker')).toBe('/stores');
    expect(legacyTarget('/kampagne/proev-det')).toBe('/campaign/try-it');
  });
});

describe('buildRedirectMap', () => {
  it('accepts internal targets and https targets', () => {
    const map = buildRedirectMap([
      { from: '/old', to: '/new' },
      { from: '/ext', to: 'https://example.com/page' },
    ]);
    expect(map.get('/old')).toEqual({ to: '/new', permanent: true });
    expect(map.get('/ext')).toEqual({ to: 'https://example.com/page', permanent: true });
  });

  it('permanent defaults to true and only explicit false makes it temporary', () => {
    const map = buildRedirectMap([
      { from: '/a', to: '/x' },
      { from: '/b', to: '/y', permanent: false },
      { from: '/c', to: '/z', permanent: true },
    ]);
    expect(map.get('/a')!.permanent).toBe(true);
    expect(map.get('/b')!.permanent).toBe(false);
    expect(map.get('/c')!.permanent).toBe(true);
  });

  it('rejects protocol-relative and backslash open-redirect targets', () => {
    const map = buildRedirectMap([
      { from: '/evil1', to: '//evil.com' },
      { from: '/evil2', to: '/\\evil.com' },
      { from: '/evil3', to: 'http://evil.com' },
      { from: '/evil4', to: 'javascript:alert(1)' },
    ]);
    expect(map.size).toBe(0);
  });

  it('rejects malformed from paths', () => {
    const map = buildRedirectMap([
      { from: 'no-leading-slash', to: '/x' },
      { from: '/has space', to: '/x' },
      { from: '/has?query', to: '/x' },
      { from: '/has#hash', to: '/x' },
    ]);
    expect(map.size).toBe(0);
  });

  it('drops entries with missing or empty from or to', () => {
    const map = buildRedirectMap([
      { from: '/only-from' },
      { to: '/only-to' },
      { from: '', to: '/x' },
      { from: '/x', to: '' },
      {},
    ]);
    expect(map.size).toBe(0);
  });

  it('normalizes trailing slashes on from, and a slash-only from becomes the root', () => {
    const map = buildRedirectMap([
      { from: '/old/', to: '/new' },
      { from: '/', to: '/home' },
    ]);
    expect(map.get('/old')).toEqual({ to: '/new', permanent: true });
    expect(map.get('/')).toEqual({ to: '/home', permanent: true });
    expect(map.has('/old/')).toBe(false);
  });

  it('handles an empty list', () => {
    expect(buildRedirectMap([]).size).toBe(0);
  });
});
