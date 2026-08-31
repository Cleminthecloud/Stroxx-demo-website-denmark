/** Pure redirect helpers, extracted verbatim from proxy.ts so the unit
 *  tests can lock their behavior without pulling in the Next server runtime.
 *  proxy.ts is the only production consumer: it fetches the CMS redirect
 *  documents and feeds them through buildRedirectMap, and routes every
 *  request path through legacyTarget. Zero behavior change from the inline
 *  originals; if you change a rule here, proxy.ts changes with it. */

export type Rule = { to: string; permanent: boolean };

/** Legacy stroxx.eu Shopify-store URLs (pre-takeover). The packaging QR
 *  codes in circulation point at /pages/... on the old store; after the
 *  domain cutover those requests hit THIS app, so the map below keeps every
 *  printed code and seven years of links alive. CMS redirects are checked
 *  first (in proxy.ts) so editors can override any single path without
 *  a deploy. */
const LEGACY_EXACT = new Map<string, string>([
  ['/pages/about', '/'],
  ['/pages/contact', '/'],
  ['/pages/categories', '/products'],
  ['/collections/all', '/products'],
  ['/cart', '/products'],
  ['/account/login', '/'],
]);

/** 2026-07-11: every route slug went English (the English base site uses
 *  English slugs; Danish slugs return with the Danish MARKET translation,
 *  see docs/STROXX-market-localisation-plan.md). These maps keep every old
 *  Danish URL alive with a permanent redirect. */
const DANISH_EXACT = new Map<string, string>([
  ['/butikker', '/stores'],
  ['/fag', '/trades'],
  ['/maanedens', '/monthly'],
  ['/nyheder', '/news'],
  ['/produkter', '/products'],
  ['/produkt', '/products'],
  ['/privatliv', '/privacy'],
  ['/handelsbetingelser', '/terms'],
  ['/komponenter', '/components'],
  ['/kampagne', '/campaign'],
  ['/kategori', '/products'],
  ['/proev-det', '/try-it'],
  /* two product names lost a stray Danish word ("hulsave") in the sweep, so
     their generated slugs moved too */
  ['/produkt/hole-saw-adapter-set-5-pcs-for-hulsave-14-30mm-32012586', '/product/hole-saw-adapter-set-5-pcs-for-hole-saws-14-30mm-32012586'],
  ['/produkt/hole-saw-adapter-set-5-pcs-for-hulsave-32-210mm-32012587', '/product/hole-saw-adapter-set-5-pcs-for-hole-saws-32-210mm-32012587'],
]);

/** Old Danish → new English data slugs (categories, trades, renamed pages).
 *  Exported so the /category/[slug] redirect can translate old ?cat= values. */
export const CATEGORY_SLUG_DA_EN: Record<string, string> = {
  adgangskontrol: 'access-control',
  arbejdstoej: 'workwear',
  batterier: 'batteries',
  belysning: 'lighting',
  'bits-skruetraekkere': 'bits-screwdrivers',
  'bor-borsaet': 'drill-bits',
  fugemasse: 'sealant',
  hulsave: 'hole-saws',
  kabeltromler: 'cable-reels',
  kemi: 'chemicals',
  knive: 'knives',
  lasere: 'lasers',
  malergrej: 'painting-tools',
  multicutterklinger: 'multi-cutter-blades',
  maalevaerktoej: 'measuring-tools',
  rundsavklinger: 'circular-saw-blades',
  sikkerhed: 'safety',
  skurvognsartikler: 'site-hut-supplies',
  topnoegler: 'socket-sets',
};

export const TRADE_SLUG_DA_EN: Record<string, string> = {
  toemrer: 'carpenter',
  elektriker: 'electrician',
  vvs: 'plumber',
  maler: 'painter',
  murer: 'bricklayer',
};

/** Danish-era URL → its English successor, or null when the path was never a
 *  Danish route. Dynamic segments carry over 1:1 (slugs under /nyheder and
 *  /produkt did not change); category and trade slugs translate via the maps
 *  above, unknown ones fall back to the section index so no old link 404s. */
export function danishTarget(path: string): string | null {
  const exact = DANISH_EXACT.get(path);
  if (exact) return exact;
  let m = path.match(/^\/produkt\/([a-z0-9-]+)$/);
  if (m) return `/product/${m[1]}`;
  m = path.match(/^\/nyheder\/([a-z0-9-]+)$/);
  if (m) return `/news/${m[1]}`;
  m = path.match(/^\/fag\/([a-z0-9-]+)$/);
  if (m) return `/trades/${TRADE_SLUG_DA_EN[m[1]] ?? ''}`.replace(/\/$/, '') || '/trades';
  m = path.match(/^\/kategori\/([a-z0-9-]+)$/);
  if (m) {
    const en = CATEGORY_SLUG_DA_EN[m[1]] ?? (m[1] === 'tape' ? 'tape' : null);
    return en ? `/category/${en}` : '/products';
  }
  m = path.match(/^\/kampagne\/(.+)$/);
  if (m) return m[1] === 'proev-det' ? '/campaign/try-it' : `/campaign/${m[1]}`;
  return null;
}

export function legacyTarget(path: string): string | null {
  const danish = danishTarget(path);
  if (danish) return danish;
  const exact = LEGACY_EXACT.get(path);
  if (exact) return exact;
  // support pages keep their exact old slugs: /pages/smart-locks-st2 → /support/smart-locks-st2
  const page = path.match(/^\/pages\/([a-z0-9-]+)$/);
  if (page) return `/support/${page[1]}`;
  /* old Shopify catalog URLs. NOTE: bare /products is now OUR products page,
   *  so only sub-paths redirect (a self-redirect would loop the site's own
   *  index; locked by tests/redirects.test.ts). */
  if (/^\/(products\/|collections(\/|$))/.test(path)) return '/products';
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
