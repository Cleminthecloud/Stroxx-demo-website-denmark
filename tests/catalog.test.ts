import { describe, expect, it } from 'vitest';
import { products } from '@/lib/data';
import {
  assertNoPriceLikeKeys,
  getCatalog,
  normalizeProduct,
  validateCatalog,
  type CatalogProduct,
  type FieldMap,
} from '@/lib/catalog';

describe('lib/catalog getCatalog (the curated adapter)', () => {
  it('emits exactly one catalogue entry per lib/data.ts product', () => {
    expect(getCatalog().length).toBe(products.length);
  });

  it('maps SKU 30012321 (socket set) field for field', () => {
    const p = getCatalog().find((c) => c.sku === '30012321');
    expect(p).toBeDefined();
    expect(p!.name).toBe('Socket set 1/2", 20 pcs');
    expect(p!.categorySlugs[0]).toBe('socket-sets');
    expect(p!.images).toEqual([{ assetId: 116544 }]);
    expect(p!.unit).toBe('Set');
    expect(p!.badges).toEqual(['VALUE', 'POPULAR']);
    expect(p!.status).toBe('active');
    expect(p!.specs).toContainEqual({ label: 'Square drive', value: '1/2"' });
  });

  it('maps SKU 30000071 (hex key set) with the default unit and primary category', () => {
    const p = getCatalog().find((c) => c.sku === '30000071');
    expect(p).toBeDefined();
    expect(p!.name).toBe('Hex key set 1,5-10mm');
    expect(p!.categorySlugs).toEqual(['bits-screwdrivers']);
    expect(p!.images).toEqual([{ assetId: 47695 }]);
    expect(p!.unit).toBe('Piece');
    expect(p!.slug).toBe('hex-key-set-1-5-10mm-30000071');
  });

  it('maps SKU 64012064 (thermal mug) from the far end of the feed', () => {
    const p = getCatalog().find((c) => c.sku === '64012064');
    expect(p).toBeDefined();
    expect(p!.name).toBe('Thermal mug black, 500 ml');
    expect(p!.categorySlugs).toEqual(['site-hut-supplies']);
    expect(p!.images).toEqual([{ assetId: 243229 }]);
  });

  it('is memoized: repeated calls return the same array instance', () => {
    expect(getCatalog()).toBe(getCatalog());
  });
});

describe('the price firewall (assertNoPriceLikeKeys)', () => {
  it('passes on the full emitted catalogue', () => {
    expect(() => assertNoPriceLikeKeys(getCatalog())).not.toThrow();
  });

  it.each([
    'price', 'listPrice', 'currency', 'vat', 'stock', 'cost', 'margin', 'moms',
  ])('throws on a record carrying a %s key', (key) => {
    expect(() => assertNoPriceLikeKeys({ sku: '123', [key]: 1 })).toThrow(/Price firewall/);
  });

  it('catches price-shaped keys nested deep in arrays and objects', () => {
    const record = { sku: '123', meta: { rows: [{ ok: true }, { unitPriceDkk: 99 }] } };
    expect(() => assertNoPriceLikeKeys(record)).toThrow(/meta\.rows\[1\]\.unitPriceDkk/);
  });

  it('rejects inStock style inventory flags too', () => {
    expect(() => assertNoPriceLikeKeys({ sku: '123', inStock: true })).toThrow(/Price firewall/);
  });

  it('lists every offender in one error', () => {
    expect(() => assertNoPriceLikeKeys({ price: 1, vatRate: 25 })).toThrow(/price.*vatRate/);
  });
});

describe('normalizeProduct (the allowlist)', () => {
  const map: FieldMap = {
    sku: (raw) => String(raw.itemNo ?? ''),
    name: 'title',
    slug: 'slug',
    categorySlugs: () => ['tape'],
    specs: () => [],
    images: () => [{ assetId: 1 }],
    status: () => 'active' as const,
  };

  it('drops every unmapped field, including price-shaped ones', () => {
    const raw = {
      itemNo: '30099999',
      title: 'Test tape',
      slug: 'test-tape-30099999',
      price: 129.95,
      listPrice: 149.95,
      currency: 'DKK',
      vat: 25,
      stockLevel: 40,
      warehouse: 'Herlev',
      color: 'black',
    };
    const out = normalizeProduct(raw, map);
    expect(out.sku).toBe('30099999');
    expect(out.name).toBe('Test tape');
    expect(Object.keys(out).sort()).toEqual(
      ['categorySlugs', 'images', 'name', 'sku', 'slug', 'specs', 'status'].sort()
    );
    expect(() => assertNoPriceLikeKeys(out)).not.toThrow();
  });

  it('omits fields whose source key is absent instead of emitting undefined', () => {
    const out = normalizeProduct({ itemNo: '1', title: 'x', slug: 'x-1' }, { ...map, ean: 'ean' });
    expect('ean' in out).toBe(false);
  });
});

describe('validateCatalog', () => {
  const good = (sku: string, name = 'A product'): CatalogProduct => ({
    sku, name, slug: `${name}-${sku}`, categorySlugs: ['tape'],
    specs: [], images: [{ assetId: 1 }], status: 'active',
  });

  it('accepts a clean catalogue', () => {
    const r = validateCatalog([good('1'), good('2')]);
    expect(r.ok).toBe(true);
    expect(r.valid.length).toBe(2);
    expect(r.errors).toEqual([]);
  });

  it('flags duplicate skus without throwing', () => {
    const r = validateCatalog([good('1'), good('1')]);
    expect(r.ok).toBe(false);
    expect(r.valid.length).toBe(1);
    expect(r.errors).toEqual([
      { index: 1, sku: '1', problems: ['duplicate sku 1'] },
    ]);
  });

  it('flags empty names and missing skus, collecting every bad record', () => {
    const r = validateCatalog([good('1', '  '), { ...good('2'), sku: '' }, good('3')]);
    expect(r.ok).toBe(false);
    expect(r.valid.map((p) => p.sku)).toEqual(['3']);
    expect(r.errors[0].problems).toContain('empty name');
    expect(r.errors[1].problems).toContain('missing sku');
  });

  it('flags an invalid status', () => {
    const r = validateCatalog([{ ...good('1'), status: 'draft' as CatalogProduct['status'] }]);
    expect(r.ok).toBe(false);
    expect(r.errors[0].problems).toContain('invalid status draft');
  });

  it('flags a record that smuggles a price-like key past the type system', () => {
    const smuggled = { ...good('1'), campaignPrice: 99 } as unknown as CatalogProduct;
    const r = validateCatalog([smuggled]);
    expect(r.ok).toBe(false);
    expect(r.errors[0].problems.join(' ')).toMatch(/campaignPrice/);
  });

  it('the full curated catalogue validates clean', () => {
    const r = validateCatalog(getCatalog());
    expect(r.ok).toBe(true);
    expect(r.valid.length).toBe(products.length);
  });
});
