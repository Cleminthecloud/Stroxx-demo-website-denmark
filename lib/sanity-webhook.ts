import { createHmac, timingSafeEqual } from 'node:crypto';

/** Verification for Sanity GROQ-powered webhook signatures, extracted here so
 *  tests/revalidate.test.ts can lock the contract (same pattern as
 *  lib/redirects.ts and lib/rate-limit.ts).
 *
 *  Sanity signs each delivery with the shared secret:
 *    sanity-webhook-signature: t=<unix ms>,v1=<base64url hmac-sha256("<t>.<body>")>
 *
 *  The timestamp window is generous (6 hours) because Sanity retries failed
 *  deliveries with backoff and a replayed request is harmless here: the
 *  endpoint only expires caches, it never writes anything. */

export const SIGNATURE_HEADER = 'sanity-webhook-signature';
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export function isValidSignature(body: string, header: string | null, secret: string, nowMs: number = Date.now()): boolean {
  if (!header || !secret) return false;
  const m = header.match(/^t=(\d+)\s*,\s*v1=([A-Za-z0-9_-]+)$/);
  if (!m) return false;
  const ts = Number(m[1]);
  if (!Number.isFinite(ts) || nowMs - ts > MAX_AGE_MS || ts - nowMs > 5 * 60 * 1000) return false;
  const expected = createHmac('sha256', secret).update(`${ts}.${body}`, 'utf8').digest('base64url');
  const a = new TextEncoder().encode(expected);
  const b = new TextEncoder().encode(m[2]);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Test helper AND documentation of the format: produce the header value the
 *  way Sanity does. Used by the unit tests; safe to use from scripts. */
export function signBody(body: string, secret: string, nowMs: number = Date.now()): string {
  const v1 = createHmac('sha256', secret).update(`${nowMs}.${body}`, 'utf8').digest('base64url');
  return `t=${nowMs},v1=${v1}`;
}
