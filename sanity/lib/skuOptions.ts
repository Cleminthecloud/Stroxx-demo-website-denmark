import { products, categoryBySlug } from '../../lib/data';

/** Shared product option list for the Studio SKU pickers (SkuInput +
 *  SkuListInput). Sourced from the code-side catalogue (lib/data.ts) today;
 *  when the PIM feed lands, swap this one module to read the feed and every
 *  picker updates with it. Keyed by item number (code / SKU). */

export type SkuOption = {
  value: string; // the item number stored in the document
  name: string;
  category: string;
  price: string;
};

export const SKU_OPTIONS: SkuOption[] = products
  .filter((p) => p.code)
  .map((p) => ({
    value: p.code as string,
    name: p.name,
    category: categoryBySlug(p.category)?.name ?? p.category,
    price: p.price,
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
