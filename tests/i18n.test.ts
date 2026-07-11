import { describe, expect, it } from 'vitest';
import {
  locales,
  REFERENCE_LOCALE,
  localeById,
  localesForMarket,
  localeFromPath,
  stripLocale,
  resolveLocale,
} from '@/lib/i18n';

/* LOCKED i18n CONTRACT (AGENT-BRIEF rule 4): locale resolved DOMAIN first
 * then PATH; registry en, da-DK, de-DE, fr-FR, nl-BE, fr-BE; Belgium is
 * bilingual on one .be domain with Dutch as the default and French under /fr. */

describe('locale registry', () => {
  it('contains exactly the six locked locale ids', () => {
    expect(locales.map((l) => l.id)).toEqual(['en', 'da-DK', 'de-DE', 'fr-FR', 'nl-BE', 'fr-BE']);
  });

  it('the reference locale is the English international root', () => {
    expect(REFERENCE_LOCALE.id).toBe('en');
    expect(REFERENCE_LOCALE.path).toBe('');
    expect(REFERENCE_LOCALE.isReference).toBe(true);
  });
});

describe('localeById', () => {
  it('finds each registered locale by id', () => {
    for (const l of locales) expect(localeById(l.id)).toBe(l);
  });

  it('returns undefined for unknown, empty, and missing ids', () => {
    expect(localeById('sv-SE')).toBeUndefined();
    expect(localeById('')).toBeUndefined();
    expect(localeById(undefined)).toBeUndefined();
  });
});

describe('localesForMarket', () => {
  it('single-language markets map to one locale', () => {
    expect(localesForMarket('dk').map((l) => l.id)).toEqual(['da-DK']);
    expect(localesForMarket('de').map((l) => l.id)).toEqual(['de-DE']);
    expect(localesForMarket('fr').map((l) => l.id)).toEqual(['fr-FR']);
    expect(localesForMarket('int').map((l) => l.id)).toEqual(['en']);
  });

  it('Belgium maps to both Belgian locales', () => {
    expect(localesForMarket('be').map((l) => l.id)).toEqual(['nl-BE', 'fr-BE']);
  });

  it('unknown and empty market codes map to no locales', () => {
    expect(localesForMarket('se')).toEqual([]);
    expect(localesForMarket('')).toEqual([]);
  });
});

describe('localeFromPath', () => {
  it('root path resolves to the English reference', () => {
    expect(localeFromPath('/').id).toBe('en');
  });

  it('resolves each locale sub-path at its root and on nested paths', () => {
    expect(localeFromPath('/dk').id).toBe('da-DK');
    expect(localeFromPath('/dk/products').id).toBe('da-DK');
    expect(localeFromPath('/de/products/skruer').id).toBe('de-DE');
    expect(localeFromPath('/fr').id).toBe('fr-FR');
    expect(localeFromPath('/be/nl').id).toBe('nl-BE');
    expect(localeFromPath('/be/nl/products').id).toBe('nl-BE');
    expect(localeFromPath('/be/fr').id).toBe('fr-BE');
    expect(localeFromPath('/be/fr/service').id).toBe('fr-BE');
  });

  it('handles trailing slashes', () => {
    expect(localeFromPath('/dk/').id).toBe('da-DK');
    expect(localeFromPath('/be/nl/').id).toBe('nl-BE');
    expect(localeFromPath('/dk/products/').id).toBe('da-DK');
  });

  it('a bare Belgian market root /be falls back to the reference', () => {
    expect(localeFromPath('/be').id).toBe('en');
  });

  it('unmatched and lookalike paths fall back to the reference', () => {
    expect(localeFromPath('/products').id).toBe('en');
    expect(localeFromPath('/dkk').id).toBe('en');
    expect(localeFromPath('/denmark').id).toBe('en');
    expect(localeFromPath('').id).toBe('en');
  });
});

describe('stripLocale', () => {
  const dk = localeById('da-DK')!;
  const nlBE = localeById('nl-BE')!;
  const en = localeById('en')!;

  it('strips a locale prefix from nested paths', () => {
    expect(stripLocale('/dk/products', dk)).toBe('/products');
    expect(stripLocale('/be/nl/products/skruer', nlBE)).toBe('/products/skruer');
  });

  it('a bare locale root strips to /', () => {
    expect(stripLocale('/dk', dk)).toBe('/');
    expect(stripLocale('/be/nl', nlBE)).toBe('/');
  });

  it('the reference locale has no prefix, path passes through', () => {
    expect(stripLocale('/products', en)).toBe('/products');
    expect(stripLocale('/', en)).toBe('/');
  });

  it('empty input normalizes to /', () => {
    expect(stripLocale('', en)).toBe('/');
  });
});

describe('resolveLocale, domain first then path', () => {
  it('each single-language ccTLD wins regardless of path', () => {
    expect(resolveLocale('stroxx.dk', '/')).toMatchObject({ strip: '' });
    expect(resolveLocale('stroxx.dk', '/').locale.id).toBe('da-DK');
    expect(resolveLocale('stroxx.dk', '/products').locale.id).toBe('da-DK');
    expect(resolveLocale('stroxx.de', '/').locale.id).toBe('de-DE');
    expect(resolveLocale('stroxx.fr', '/service').locale.id).toBe('fr-FR');
  });

  it('the domain wins even when the path carries another locale prefix', () => {
    const r = resolveLocale('stroxx.dk', '/de/products');
    expect(r.locale.id).toBe('da-DK');
    expect(r.strip).toBe('');
  });

  it('www prefix and host casing are normalized', () => {
    expect(resolveLocale('www.stroxx.dk', '/').locale.id).toBe('da-DK');
    expect(resolveLocale('STROXX.DE', '/').locale.id).toBe('de-DE');
    expect(resolveLocale('Stroxx.Fr', '/').locale.id).toBe('fr-FR');
    // the www strip runs on the raw host, before lowercasing: an uppercase
    // WWW is not stripped (real hostnames from req.nextUrl are lowercase)
    expect(resolveLocale('WWW.stroxx.fr', '/').locale.id).toBe('en');
  });

  it('the Belgian domain defaults to Dutch', () => {
    const r = resolveLocale('stroxx.be', '/');
    expect(r.locale.id).toBe('nl-BE');
    expect(r.strip).toBe('');
    expect(resolveLocale('stroxx.be', '/products').locale.id).toBe('nl-BE');
  });

  it('the Belgian domain serves French under /fr', () => {
    const root = resolveLocale('stroxx.be', '/fr');
    expect(root.locale.id).toBe('fr-BE');
    expect(root.strip).toBe('/fr');
    const nested = resolveLocale('stroxx.be', '/fr/products');
    expect(nested.locale.id).toBe('fr-BE');
    expect(nested.strip).toBe('/fr');
  });

  it('a Belgian path that merely starts with fr stays Dutch', () => {
    expect(resolveLocale('stroxx.be', '/fritues').locale.id).toBe('nl-BE');
  });

  it('the .eu fallback domain resolves by sub-path', () => {
    expect(resolveLocale('stroxx.eu', '/').locale.id).toBe('en');
    expect(resolveLocale('stroxx.eu', '/dk/products')).toMatchObject({ strip: '/dk' });
    expect(resolveLocale('stroxx.eu', '/dk/products').locale.id).toBe('da-DK');
    expect(resolveLocale('stroxx.eu', '/be/fr').locale.id).toBe('fr-BE');
    expect(resolveLocale('stroxx.eu', '/be/nl').strip).toBe('/be/nl');
  });

  it('unknown domains (previews, localhost) also resolve by sub-path', () => {
    expect(resolveLocale('localhost', '/de').locale.id).toBe('de-DE');
    expect(resolveLocale('preview.vercel.app', '/').locale.id).toBe('en');
    expect(resolveLocale('example.com', '/be/nl/service').locale.id).toBe('nl-BE');
  });

  it('empty host falls through to path resolution', () => {
    expect(resolveLocale('', '/dk').locale.id).toBe('da-DK');
    expect(resolveLocale('', '/').locale.id).toBe('en');
  });
});
