import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rate-limit';

/** CSP violation collector: browsers POST here when the Content-Security-
 *  Policy blocks something. Reports land in the Vercel runtime logs
 *  (Observability → Logs, search "csp-violation"), which is exactly where
 *  you look when a new marketing tag or embed "mysteriously" does nothing.
 *  Rate-limited hard: a broken page can fire hundreds of reports. */

export const maxDuration = 10;

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`csp:${clientIp(req.headers)}`, 20, 60000))) return new NextResponse(null, { status: 204 });
  try {
    const body = await req.json();
    const r = body?.['csp-report'] ?? body;
    // eslint-disable-next-line no-console
    console.warn('csp-violation', {
      blocked: String(r?.['blocked-uri'] ?? '').slice(0, 200),
      directive: String(r?.['violated-directive'] ?? '').slice(0, 100),
      page: String(r?.['document-uri'] ?? '').slice(0, 200),
    });
  } catch {
    /* malformed reports are noise */
  }
  return new NextResponse(null, { status: 204 });
}
