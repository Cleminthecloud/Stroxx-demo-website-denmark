import { productBuyUrl, categoryBuyUrl, CR_BRAND, UTM } from '@/lib/data';
import type { Market } from '@/lib/markets';

/** Resolve the buy URL for the CURRENT market's single dealer. Returns null when
 *  there is no buy destination: the international/reference market (no single
 *  dealer) AND a dealer market whose Buy-at CTA link is missing in the CMS.
 *  Callers open the dealer chooser on null. Denmark (Carl Ras) gets a product
 *  deep-link when a code is given; other dealers link to their storefront (no
 *  per-product deep-links yet). NEVER fall back to another market's shop: a
 *  German visitor must not land on carl-ras.dk. This is the ONE place a market
 *  maps to a buy URL — never hand-write a Carl Ras link in a component. */
export function dealerBuyUrl(dealer: Market | null | undefined, code?: string): string | null {
  if (!dealer) return null;
  if (dealer.code === 'dk') return code ? productBuyUrl(code) : `${CR_BRAND}/?${UTM}`;
  return dealer.dealerCtaUrl || null;
}

/** Category equivalent of dealerBuyUrl: "see the whole category at the dealer".
 *  Only Carl Ras has category deep-links today; other dealers land on their
 *  storefront. null = no dealer (international) or no CTA link → callers hide
 *  the link or fall back to the internal category page. Same contract: never
 *  another market's shop. */
export function dealerCategoryUrl(dealer: Market | null | undefined, path?: string): string | null {
  if (!dealer) return null;
  if (dealer.code === 'dk') return path ? categoryBuyUrl(path) : `${CR_BRAND}/?${UTM}`;
  return dealer.dealerCtaUrl || null;
}
