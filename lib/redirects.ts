/** Pure redirect helpers, extracted verbatim from middleware.ts so the unit
 *  tests can lock their behavior without pulling in the Next server runtime.
 *  middleware.ts is the only production consumer: it fetches the CMS redirect
 *  documents and feeds them through buildRedirectMap, and routes every
 *  request path through legacyTarget. Zero behavior change from the inline
 *  originals; if you change a rule here, middleware.ts changes with it. */

export type Rule = { to: string; permanent: boolean };

/** Legacy stroxx.eu Shopify-store URLs (pre-takeover). The packaging QR
 *  codes in circulation point at /pages/... on the old store; after the
 *  domain cutover those requests hit THIS app, so the map below keeps every
 *  printed code and seven years of links alive. CMS redirects are checked
 *  first (in middleware.ts) so editors can override any single path without
 *  a deploy. */
const LEGACY_EXACT = new Map<string, string>([
  ['/pages/about', '/'],
  ['/pages/contact', '/'],
  ['/pages/categories', '/produkter'],
  ['/collections/all', '/produkter'],
  ['/cart', '/produkter'],
  ['/account/login', '/'],
]);

export function legacyTarget(path: string): string | null {
  const exact = LEGACY_EXACT.get(path);
  if (exact) return exact;
  // support pages keep their exact old slugs: /pages/smart-locks-st2 → /support/smart-locks-st2
  const page = path.match(/^\/pages\/([a-z0-9-]+)$/);
  if (page) return `/support/${page[1]}`;
  if (/^\/(products|collections)(\/|$)/.test(path)) return '/produkter';
  if (/^\/(account|customer_authentication|challenge)(\/|$)/.test(path)) return '/';
  return null;
}

/** Build the redirect lookup map from raw CMS redirect documents. */
export function buildRedirectMap(entries: { from?: string; to?: string; permanent?: boolean }[]): Map<string, Rule> {
  const map = new Map<string, Rule>();
  for (const r of entries) {
    // stricter than the schema; a bad document must not become an open redirect.
    // Internal targets need a single leading '/' NOT followed by '/' or '\':
    // '//evil.com' and '/\evil.com' resolve to an external origin in new URL().
    if (!r.from || !r.to) continue;
    if (!/^\/[^\s?#]*$/.test(r.from)) continue;
    if (!/^\/(?![/\\])[^\s]*$/.test(r.to) && !/^https:\/\/[^\s]+$/.test(r.to)) continue;
    map.set(r.from.replace(/\/+$/, '') || '/', { to: r.to, permanent: r.permanent !== false });
  }
  return map;
}
