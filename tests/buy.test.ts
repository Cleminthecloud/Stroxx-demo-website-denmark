import { describe, expect, it } from 'vitest';
import { dealerBuyUrl, dealerCategoryUrl } from '@/lib/buy';
import { CR_BRAND, UTM } from '@/lib/data';
import { PDP_PATHS } from '@/lib/pdp';
import { markets, marketByCode } from '@/lib/markets';
import type { Market } from '@/lib/markets';

/* LOCKED BUY CONTRACT (AGENT-BRIEF rule 3): DK always Carl Ras; other markets
 * their own dealerCtaUrl or null; null means the DealerChooser opens; NEVER a
 * cross-market fallback to Carl Ras. */

const KNOWN_CODE = '30000071'; // real code present in PDP_PATHS
const UNKNOWN_CODE = '99999999'; // not in PDP_PATHS

const dk = marketByCode('dk')!;
const de = marketByCode('de')!;
const fr = marketByCode('fr')!;
const be = marketByCode('be')!;
const int = marketByCode('int')!;

describe('dealerBuyUrl', () => {
  it('returns null for a null dealer', () => {
    expect(dealerBuyUrl(null)).toBeNull();
    expect(dealerBuyUrl(null, KNOWN_CODE)).toBeNull();
  });

  it('returns null for an undefined dealer', () => {
    expect(dealerBuyUrl(undefined)).toBeNull();
    expect(dealerBuyUrl(undefined, KNOWN_CODE)).toBeNull();
  });

  it('DK without a code links to the Carl Ras STROXX storefront with UTM', () => {
    expect(dealerBuyUrl(dk)).toBe(`${CR_BRAND}/?${UTM}`);
  });

  it('DK with an empty string code falls back to the Carl Ras storefront', () => {
    expect(dealerBuyUrl(dk, '')).toBe(`${CR_BRAND}/?${UTM}`);
  });

  it('DK with a known code deep-links to the Carl Ras PDP with UTM', () => {
    const url = dealerBuyUrl(dk, KNOWN_CODE)!;
    expect(url).toContain('https://www.carl-ras.dk');
    expect(url).toContain(PDP_PATHS[KNOWN_CODE].split('?')[0]);
    expect(url).toContain(UTM);
  });

  it('DK with an unknown code falls back to a Carl Ras search link', () => {
    const url = dealerBuyUrl(dk, UNKNOWN_CODE)!;
    expect(url).toBe(`https://www.carl-ras.dk/search/?search=${UNKNOWN_CODE}&${UTM}`);
  });

  it('DE links to the German dealer CTA, never Carl Ras, code ignored', () => {
    expect(dealerBuyUrl(de)).toBe(de.dealerCtaUrl);
    expect(dealerBuyUrl(de, KNOWN_CODE)).toBe(de.dealerCtaUrl);
    expect(dealerBuyUrl(de, KNOWN_CODE)).not.toContain('carl-ras');
  });

  it('FR links to the French dealer CTA, never Carl Ras', () => {
    expect(dealerBuyUrl(fr)).toBe(fr.dealerCtaUrl);
    expect(dealerBuyUrl(fr, KNOWN_CODE)).toBe(fr.dealerCtaUrl);
    expect(dealerBuyUrl(fr, KNOWN_CODE)).not.toContain('carl-ras');
  });

  it('BE links to the Belgian dealer CTA, never Carl Ras', () => {
    expect(dealerBuyUrl(be)).toBe(be.dealerCtaUrl);
    expect(dealerBuyUrl(be, KNOWN_CODE)).toBe(be.dealerCtaUrl);
    expect(dealerBuyUrl(be, KNOWN_CODE)).not.toContain('carl-ras');
  });

  it('the international market has no dealer CTA and resolves to null, with or without a code', () => {
    expect(dealerBuyUrl(int)).toBeNull();
    expect(dealerBuyUrl(int, KNOWN_CODE)).toBeNull();
  });

  it('a dealer market with a missing dealerCtaUrl resolves to null, never a Carl Ras fallback', () => {
    const noCta: Market = { ...de, dealerCtaUrl: undefined };
    expect(dealerBuyUrl(noCta)).toBeNull();
    expect(dealerBuyUrl(noCta, KNOWN_CODE)).toBeNull();
  });

  it('a dealer market with an empty string dealerCtaUrl resolves to null', () => {
    const emptyCta: Market = { ...fr, dealerCtaUrl: '' };
    expect(dealerBuyUrl(emptyCta)).toBeNull();
    expect(dealerBuyUrl(emptyCta, KNOWN_CODE)).toBeNull();
  });

  it('an unknown market code follows the dealerCtaUrl-or-null rule, never Carl Ras', () => {
    const unknown: Market = { code: 'se', dealerCtaUrl: 'https://example.se' };
    expect(dealerBuyUrl(unknown, KNOWN_CODE)).toBe('https://example.se');
    expect(dealerBuyUrl({ code: 'se' }, KNOWN_CODE)).toBeNull();
  });

  it('an empty string market code never reaches the DK branch', () => {
    expect(dealerBuyUrl({ code: '' }, KNOWN_CODE)).toBeNull();
    expect(dealerBuyUrl({ code: '', dealerCtaUrl: 'https://example.org' })).toBe('https://example.org');
  });

  it('only the DK market ever resolves to a carl-ras.dk URL across the whole registry', () => {
    for (const m of markets) {
      const url = dealerBuyUrl(m, KNOWN_CODE);
      if (m.code === 'dk') expect(url).toContain('carl-ras.dk');
      else if (url) expect(url).not.toContain('carl-ras');
    }
  });
});

describe('dealerCategoryUrl', () => {
  it('returns null for a null or undefined dealer', () => {
    expect(dealerCategoryUrl(null)).toBeNull();
    expect(dealerCategoryUrl(undefined, 'skruer')).toBeNull();
  });

  it('DK with a category path deep-links into the Carl Ras STROXX category with UTM', () => {
    expect(dealerCategoryUrl(dk, 'skruer')).toBe(`${CR_BRAND}/skruer/?${UTM}`);
  });

  it('DK without a path falls back to the Carl Ras storefront', () => {
    expect(dealerCategoryUrl(dk)).toBe(`${CR_BRAND}/?${UTM}`);
  });

  it('DK with an empty string path falls back to the Carl Ras storefront', () => {
    expect(dealerCategoryUrl(dk, '')).toBe(`${CR_BRAND}/?${UTM}`);
  });

  it('non-DK dealer markets land on their own storefront, path ignored', () => {
    expect(dealerCategoryUrl(de, 'skruer')).toBe(de.dealerCtaUrl);
    expect(dealerCategoryUrl(fr, 'skruer')).toBe(fr.dealerCtaUrl);
    expect(dealerCategoryUrl(be, 'skruer')).toBe(be.dealerCtaUrl);
  });

  it('international and CTA-less dealers resolve to null, never Carl Ras', () => {
    expect(dealerCategoryUrl(int, 'skruer')).toBeNull();
    expect(dealerCategoryUrl({ ...be, dealerCtaUrl: undefined }, 'skruer')).toBeNull();
    expect(dealerCategoryUrl({ ...be, dealerCtaUrl: '' }, 'skruer')).toBeNull();
  });

  it('unknown market codes follow the dealerCtaUrl-or-null rule', () => {
    expect(dealerCategoryUrl({ code: 'nl', dealerCtaUrl: 'https://example.nl' }, 'x')).toBe('https://example.nl');
    expect(dealerCategoryUrl({ code: 'nl' }, 'x')).toBeNull();
  });
});
