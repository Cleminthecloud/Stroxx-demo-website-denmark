import type { NextRequest } from 'next/server';

/** True when a POST comes from our own pages (or a non-browser client is at
 *  least not claiming to be another site). Browsers send Sec-Fetch-Site
 *  and/or Origin on cross-site requests, so this cheaply blocks drive-by
 *  cross-site abuse of the endpoints that spend money (/api/blog-agent) or
 *  write data (/api/track, /api/newsletter, /api/form). It is not an auth
 *  system: rate limits and provider-side spend caps remain the backstops. */
export function sameOrigin(req: NextRequest): boolean {
  const site = req.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== req.nextUrl.host) return false;
    } catch {
      return false;
    }
  }
  return true;
}
