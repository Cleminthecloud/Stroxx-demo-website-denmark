import { productBuyUrl, CR_BRAND, UTM } from '@/lib/data';
import type { Market } from '@/lib/markets';

/** Resolve the buy URL for the CURRENT market's single dealer. Returns null when
 *  there is no single dealer (international / reference) — callers open the dealer
 *  chooser in that case. Denmark (Carl Ras) gets a product deep-link when a code
 *  is given; other dealers link to their storefront (no per-product deep-links
 *  yet). This is the ONE place a market maps to a buy URL — never hand-write a
 *  Carl Ras link in a component. */
export function dealerBuyUrl(dealer: Market | null | undefined, code?: string): string | null {
  if (!dealer) return null;
  if (dealer.code === 'dk' && code) return productBuyUrl(code);
  if (dealer.dealerCtaUrl) return dealer.dealerCtaUrl;
  return code ? productBuyUrl(code) : `${CR_BRAND}/?${UTM}`;
}
