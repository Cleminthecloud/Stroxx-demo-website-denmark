import { NextRequest, NextResponse } from 'next/server';

/** CMS-managed redirects (the `redirect` document type in the Studio).
 *  Editors rename a campaign page, add a redirect, and old QR codes /
 *  printed URLs / newsletter links keep working, no deploy needed.
 *
 *  The redirect list is fetched from Sanity's public CDN and cached in
 *  module memory for 60s per server instance, so the per-request cost is
 *  a Map lookup. Any failure (fetch, parse, config) falls through to
 *  NextResponse.next(): broken redirects can never break the site. */

type Rule = { to: string; permanent: boolean };

/** Legacy stroxx.eu Shopify-store URLs (pre-takeover). The packaging QR
 *  codes in circulation point at /pages/... on the old store; after the
 *  domain cutover those requests hit THIS app, so the map below keeps every
 *  printed code and seven years of links alive. CMS redirects (below) are
 *  checked first so editors can override any single path without a deploy. */
const LEGACY_EXACT = new Map<string, string>([
  ['/pages/about', '/'],
  ['/pages/contact', '/'],
  ['/pages/categories', '/produkter'],
  ['/collections/all', '/produkter'],
  ['/cart', '/produkter'],
  ['/account/login', '/'],
]);

function legacyTarget(path: string): string | null {
  const exact = LEGACY_EXACT.get(path);
  if (exact) return exact;
  // support pages keep their exact old slugs: /pages/smart-locks-st2 → /support/smart-locks-st2
  const page = path.match(/^\/pages\/([a-z0-9-]+)$/);
  if (page) return `/support/${page[1]}`;
  if (/^\/(products|collections)(\/|$)/.test(path)) return '/produkter';
  if (/^\/(account|customer_authentication|challenge)(\/|$)/.test(path)) return '/';
  return null;
}

const TTL_MS = 60_000;
let cache: { at: number; map: Map<string, Rule> } | null = null;

async function getRules(): Promise<Map<string, Rule>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) return cache?.map ?? new Map();
  const query = encodeURIComponent('*[_type=="redirect"]{from,to,permanent}');
  const res = await fetch(
    `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`,
    { signal: AbortSignal.timeout(2000) }
  );
  if (!res.ok) return cache?.map ?? new Map();
  const json = (await res.json()) as { result?: { from?: string; to?: string; permanent?: boolean }[] };
  const map = new Map<string, Rule>();
  for (const r of json.result ?? []) {
    // same validation as the schema; a bad document must not become an open redirect
    if (!r.from || !r.to) continue;
    if (!/^\/[^\s?#]*$/.test(r.from)) continue;
    if (!/^\/[^\s]*$/.test(r.to) && !/^https:\/\/[^\s]+$/.test(r.to)) continue;
    map.set(r.from.replace(/\/+$/, '') || '/', { to: r.to, permanent: r.permanent !== false });
  }
  cache = { at: Date.now(), map };
  return map;
}

export async function middleware(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname.replace(/\/+$/, '') || '/';
    const rules = await getRules();
    const hit = rules.get(path);
    if (hit) {
      const dest = hit.to.startsWith('/') ? new URL(hit.to + req.nextUrl.search, req.url) : new URL(hit.to);
      return NextResponse.redirect(dest, hit.permanent ? 308 : 307);
    }
    const legacy = legacyTarget(path);
    if (legacy) return NextResponse.redirect(new URL(legacy, req.url), 308);
    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  /* pages only: skip Next internals, API routes, the Studio and any file
     with an extension (images, fonts, pdfs...) */
  matcher: ['/((?!_next|api|studio|.*\\.).*)'],
};
