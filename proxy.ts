import { NextRequest, NextResponse } from 'next/server';
import { resolveLocale } from '@/lib/i18n';
import { buildRedirectMap, legacyTarget, type Rule } from '@/lib/redirects';

/** Request proxy: locale resolution + redirects, on every page request.
 *
 *  This was `middleware.ts` until 2026-08-31. Next.js 16 deprecated the
 *  middleware file convention and renamed it to `proxy`: same position in the
 *  request lifecycle, same `config.matcher`, same NextRequest/NextResponse API.
 *  Two things actually changed, and both are fine for us:
 *    1. the exported function is `proxy`, not `middleware`;
 *    2. it runs on the Node.js runtime, which cannot be overridden. Nothing
 *       here was edge-specific (a fetch with a timeout, a Map lookup), and
 *       `lib/i18n.ts` is deliberately pure TS with no `next/headers`, so it
 *       imports cleanly in either runtime.
 *
 *  CMS-managed redirects (the `redirect` document type in the Studio):
 *  editors rename a campaign page, add a redirect, and old QR codes /
 *  printed URLs / newsletter links keep working, no deploy needed.
 *
 *  The redirect list is fetched from Sanity's public CDN and cached in
 *  module memory for 60s per server instance, so the per-request cost is
 *  a Map lookup. Any failure (fetch, parse, config) falls through to
 *  NextResponse.next(): broken redirects can never break the site. */

/* The legacy-URL map (legacyTarget) and the CMS redirect validation
 * (buildRedirectMap) live in lib/redirects.ts: pure, unit-tested, extracted
 * verbatim from this file. Printed packaging depends on those maps, so they
 * are locked by tests/redirects.test.ts. */

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
  const map = buildRedirectMap(json.result ?? []);
  cache = { at: Date.now(), map };
  return map;
}

export async function proxy(req: NextRequest) {
  try {
    const host = req.nextUrl.hostname;
    const rawPath = req.nextUrl.pathname.replace(/\/+$/, '') || '/';
    const { locale, strip } = resolveLocale(host, rawPath);
    // the in-app route with any locale sub-path prefix removed
    const appPath = strip && (rawPath === strip || rawPath.startsWith(strip + '/')) ? rawPath.slice(strip.length) || '/' : rawPath;

    // redirects (CMS + legacy) run on the app path; keep the locale prefix on the destination
    const rules = await getRules();
    const hit = rules.get(appPath);
    if (hit) {
      const dest = hit.to.startsWith('/') ? new URL(strip + hit.to + req.nextUrl.search, req.url) : new URL(hit.to);
      return NextResponse.redirect(dest, hit.permanent ? 308 : 307);
    }
    const legacy = legacyTarget(appPath);
    if (legacy) return NextResponse.redirect(new URL(strip + legacy, req.url), 308);

    // carry the resolved locale to the app via a request header
    const headers = new Headers(req.headers);
    headers.set('x-stroxx-locale', locale.id);
    if (appPath !== rawPath) {
      const url = req.nextUrl.clone();
      url.pathname = appPath;
      return NextResponse.rewrite(url, { request: { headers } });
    }
    return NextResponse.next({ request: { headers } });
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  /* pages only: skip Next internals, API routes, the Studio and any file
     with an extension (images, fonts, pdfs...) */
  matcher: ['/((?!_next|api|studio|.*\\.).*)'],
};
