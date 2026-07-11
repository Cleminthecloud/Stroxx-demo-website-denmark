import { describe, expect, it } from 'vitest';
import { legacyTarget, buildRedirectMap } from '@/lib/redirects';

/* Locks the legacy Shopify URL map (printed packaging QR codes depend on it)
 * and the CMS redirect validation (a bad document must never become an open
 * redirect). Extracted verbatim from middleware.ts into lib/redirects.ts. */

describe('legacyTarget', () => {
  it('maps the exact legacy store paths', () => {
    expect(legacyTarget('/pages/about')).toBe('/');
    expect(legacyTarget('/pages/contact')).toBe('/');
    expect(legacyTarget('/pages/categories')).toBe('/produkter');
    expect(legacyTarget('/collections/all')).toBe('/produkter');
    expect(legacyTarget('/cart')).toBe('/produkter');
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

  it('product and collection trees land on /produkter', () => {
    expect(legacyTarget('/products/some-old-product')).toBe('/produkter');
    expect(legacyTarget('/products')).toBe('/produkter');
    expect(legacyTarget('/collections/tools')).toBe('/produkter');
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
    expect(legacyTarget('/produkter')).toBeNull();
    expect(legacyTarget('/support/mmexo')).toBeNull();
    expect(legacyTarget('')).toBeNull();
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
