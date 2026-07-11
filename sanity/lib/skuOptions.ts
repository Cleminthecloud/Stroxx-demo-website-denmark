import { categoryBySlug } from '../../lib/data';
import { getCatalog } from '../../lib/catalog';

/** Shared product option list for the Studio SKU pickers (SkuInput +
 *  SkuListInput). Sourced from the catalogue seam (lib/catalog getCatalog(),
 *  the validated, price-firewalled feed); when the PIM feed lands, the seam
 *  swaps its adapter and every picker updates with no change here. Keyed by
 *  item number (SKU). Category display names still come from lib/data.ts
 *  categories (the catalogue carries slugs only). */

export type SkuOption = {
  value: string; // the item number stored in the document
  name: string;
  category: string;
  // No price: the brand site never shows or uses prices (dealer's job).
};

export const SKU_OPTIONS: SkuOption[] = getCatalog()
  .map((p) => ({
    value: p.sku,
    name: p.name,
    category: categoryBySlug(p.categorySlugs[0])?.name ?? p.categorySlugs[0],
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const skuByCode = new Map<string, SkuOption>(SKU_OPTIONS.map((o) => [o.value, o]));

/** Case-insensitive match on item number, name or category. */
export function skuMatches(query: string, o: SkuOption): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return (
    o.value.toLowerCase().includes(q) ||
    o.name.toLowerCase().includes(q) ||
    o.category.toLowerCase().includes(q)
  );
}

/** A label like "30012321 · Socket set 1/2\", 20 pcs" for a stored code. */
export function skuLabel(code: string): string {
  const o = skuByCode.get(code);
  return o ? `${o.value} · ${o.name}` : code;
}
