// lib/catalog/curated.ts
// The curated adapter: wraps today's code-side catalogue (lib/data.ts, the
// 358 real SKUs harvested from carl-ras.dk) in the PimAdapter contract, so
// the whole pipeline (adapter -> allowlist normalizer -> validation) runs in
// production NOW against real data. When the Carl Ras PIM feed lands, a new
// adapter replaces this one and nothing downstream changes.
//
// Must stay client-safe (no node APIs, no server-only): the Studio SKU
// pickers import getCatalog via sanity/lib/skuOptions.ts.

import { products } from '../data';
import { normalizeProduct, validateCatalog, type FieldMap } from './normalize';
import type { CatalogProduct, PimAdapter, RawProductRecord } from './types';

/** Today's products as raw feed records, exactly as a PIM export would hand
 *  them over: plain untyped rows. The normalizer decides what survives. */
const curatedRawRecords = (): RawProductRecord[] =>
  products.map((p) => ({
    code: p.code,
    name: p.name,
    slug: p.slug,
    category: p.category,
    tags: p.tags,
    specs: p.specs,
    imgId: p.imgId,
    badges: p.badges,
    unit: p.unit,
    blurb: p.blurb,
  }));

/** The real FieldMap for the curated feed: sku from the item code,
 *  categorySlugs from primary category plus tags (deduped, primary first),
 *  images from the single Digizuite asset id. Everything not named here is
 *  dropped by construction. */
const CURATED_FIELD_MAP: FieldMap = {
  sku: (raw) => String(raw.code ?? ''),
  name: 'name',
  slug: 'slug',
  categorySlugs: (raw) => {
    const primary = typeof raw.category === 'string' ? [raw.category] : [];
    const tags = Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === 'string') : [];
    return [...new Set([...primary, ...tags])];
  },
  specs: (raw) => (Array.isArray(raw.specs) ? (raw.specs as CatalogProduct['specs']) : []),
  images: (raw) => (typeof raw.imgId === 'number' ? [{ assetId: raw.imgId }] : []),
  // The curated set IS the live assortment; discontinued items are removed
  // from lib/data.ts rather than flagged, so everything present is active.
  status: () => 'active' as const,
  badges: (raw) => (Array.isArray(raw.badges) ? raw.badges.map(String) : []),
  unit: 'unit',
  blurb: 'blurb',
};

/** The curated source in adapter clothing, for the future sync runner. */
export const curatedPimAdapter: PimAdapter = {
  name: 'curated (lib/data.ts snapshot)',
  fetchProducts: async () => curatedRawRecords(),
};

let cache: CatalogProduct[] | null = null;

/** The full validated catalogue. Memoized: the curated data is static, so
 *  the normalize + validate pass runs once per process. Fails closed: a
 *  validation error here means the committed data itself broke the contract,
 *  which must surface as a build/test failure, never a partial catalogue. */
export function getCatalog(): CatalogProduct[] {
  if (cache) return cache;
  const normalized = curatedRawRecords().map((raw) => normalizeProduct(raw, CURATED_FIELD_MAP));
  const result = validateCatalog(normalized);
  if (!result.ok) {
    const report = result.errors
      .map((e) => `#${e.index}${e.sku ? ` (${e.sku})` : ''}: ${e.problems.join('; ')}`)
      .join(' | ');
    throw new Error(`Curated catalogue failed validation: ${report}`);
  }
  cache = result.valid;
  return cache;
}
