// lib/catalog/normalize.ts
// The allowlist normalizer: the ONLY door raw feed data passes through on
// its way into the platform. Two guarantees, both structural:
//
// 1. ALLOWLIST MAPPING. normalizeProduct builds its output field by field
//    from an explicit FieldMap. A raw field that no FieldMap entry names is
//    dropped by construction; there is no spread, no copy-the-rest branch.
//    A PIM export can add fifty columns tomorrow and none of them enter.
//
// 2. THE PRICE FIREWALL. assertNoPriceLikeKeys walks any object tree and
//    throws on any key matching the price pattern (price, cost, currency,
//    vat, margin, stock, Danish moms). validateCatalog runs it over every
//    normalized product, so even a mapping mistake cannot smuggle a
//    price-shaped field into a snapshot. tests/catalog.test.ts locks both.

import type { CatalogProduct, RawProductRecord } from './types';

/** Declares, per CatalogProduct field, where the value comes from: either a
 *  raw key to copy verbatim, or an extractor over the whole raw record.
 *  Only fields named here can appear in the output. */
export type FieldMap = {
  [K in keyof CatalogProduct]?: string | ((raw: RawProductRecord) => CatalogProduct[K]);
};

const CATALOG_FIELDS = [
  'sku', 'name', 'slug', 'categorySlugs', 'specs', 'images',
  'ean', 'status', 'badges', 'unit', 'blurb',
] as const;

/** Map one raw feed record to a CatalogProduct via the allowlist FieldMap.
 *  Shape validity (sku present, status valid, ...) is validateCatalog's job;
 *  this function only decides which fields exist at all. */
export function normalizeProduct(raw: RawProductRecord, map: FieldMap): CatalogProduct {
  const out: Record<string, unknown> = {};
  for (const field of CATALOG_FIELDS) {
    const rule = map[field];
    if (rule === undefined) continue;
    const value = typeof rule === 'function' ? rule(raw) : raw[rule];
    if (value !== undefined) out[field] = value;
  }
  return out as CatalogProduct;
}

/** Key pattern that must never appear anywhere in catalogue data. 'moms' is
 *  Danish VAT; 'stock' also catches inStock/stockLevel style flags, which
 *  are NOT allowed (the in-assortment signal is `status`, never inventory). */
const PRICE_LIKE = /price|cost|currency|vat|margin|stock|moms/i;

/** Keys exempt from the price pattern. Intentionally EMPTY: no current
 *  catalogue field collides with the pattern (checked against the full
 *  curated feed). Adding an entry here is a contract change and needs the
 *  same scrutiny as adding a field to CatalogProduct. */
const KEY_ALLOWLIST: ReadonlySet<string> = new Set([]);

const collectPriceLikeKeys = (node: unknown, path: string, offenders: string[]): void => {
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectPriceLikeKeys(item, `${path}[${i}]`, offenders));
    return;
  }
  if (node === null || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    const keyPath = path ? `${path}.${key}` : key;
    if (PRICE_LIKE.test(key) && !KEY_ALLOWLIST.has(key)) offenders.push(keyPath);
    collectPriceLikeKeys(value, keyPath, offenders);
  }
};

/** Walk any object tree and throw, listing every offending key path, if any
 *  key matches the price pattern. The firewall's runtime teeth. */
export function assertNoPriceLikeKeys(obj: unknown): void {
  const offenders: string[] = [];
  collectPriceLikeKeys(obj, '', offenders);
  if (offenders.length) {
    throw new Error(
      `Price firewall: forbidden price-like key(s) found: ${offenders.join(', ')}. ` +
      'Price, cost, currency, VAT, margin and stock data never enters the platform ' +
      '(see lib/catalog/types.ts).'
    );
  }
}

export type CatalogRecordError = {
  index: number;
  sku?: string;
  problems: string[];
};

export type CatalogValidation = {
  ok: boolean;
  /** Records that passed every check, in feed order. */
  valid: CatalogProduct[];
  /** One entry per failing record; empty when ok. */
  errors: CatalogRecordError[];
};

/** Validate a normalized catalogue: sku present and unique, name nonempty,
 *  status valid, and no price-like keys anywhere in the record. Individual
 *  bad records never throw; they are collected so a sync can fail closed
 *  with a full report (keep the previous snapshot, alert with the list). */
export function validateCatalog(products: CatalogProduct[]): CatalogValidation {
  const valid: CatalogProduct[] = [];
  const errors: CatalogRecordError[] = [];
  const seenSkus = new Set<string>();

  products.forEach((p, index) => {
    const problems: string[] = [];
    const sku = typeof p.sku === 'string' ? p.sku.trim() : '';

    if (!sku) problems.push('missing sku');
    else if (seenSkus.has(sku)) problems.push(`duplicate sku ${sku}`);
    if (typeof p.name !== 'string' || !p.name.trim()) problems.push('empty name');
    if (p.status !== 'active' && p.status !== 'discontinued') {
      problems.push(`invalid status ${String(p.status)}`);
    }
    try {
      assertNoPriceLikeKeys(p);
    } catch (e) {
      problems.push(e instanceof Error ? e.message : String(e));
    }

    if (sku) seenSkus.add(sku);
    if (problems.length) errors.push({ index, sku: sku || undefined, problems });
    else valid.push(p);
  });

  return { ok: errors.length === 0, valid, errors };
}
