/** Rate limiter for the public API routes, two tiers behind one call:
 *
 *  - With UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in the hosting
 *    environment: a SHARED fixed-window counter in Upstash Redis, one limit
 *    across every serverless instance (the production posture the pen test
 *    expects). Free tier covers this site's volumes comfortably.
 *  - Without them: the original in-memory sliding window per instance, a
 *    speed bump rather than a guarantee, and the automatic fallback if
 *    Upstash errors or times out (2s), so rate limiting can never take the
 *    API down.
 *
 *  Adding the env vars IS the upgrade; no code change, no redeploy ordering. */

const UP_URL = process.env.UPSTASH_REDIS_REST_URL;
const UP_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const hits = new Map<string, number[]>();

function memoryLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  // opportunistic cleanup so the map can't grow unbounded
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (UP_URL && UP_TOKEN) {
    try {
      const bucket = `rl:${key}:${Math.floor(Date.now() / windowMs)}`;
      const r = await fetch(`${UP_URL}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UP_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([
          ['INCR', bucket],
          ['EXPIRE', bucket, String(Math.ceil(windowMs / 1000)), 'NX'],
        ]),
        signal: AbortSignal.timeout(2000),
        cache: 'no-store',
      });
      if (r.ok) {
        const j = (await r.json()) as { result?: number }[];
        const count = Number(j?.[0]?.result ?? 0);
        if (count > 0) return count <= limit;
      }
    } catch {
      /* Upstash unreachable → in-memory fallback below */
    }
  }
  return memoryLimit(key, limit, windowMs);
}

/** Client IP for rate-limit keys. Assumes deployment behind Vercel's proxy:
 *  `x-real-ip` is set by the platform from the connecting socket and cannot be
 *  spoofed by the client. Fallback is the RIGHTMOST `x-forwarded-for` entry,
 *  the value appended by the trusted proxy itself. Never trust the leftmost
 *  entry: it is client-supplied, so an attacker sending a random XFF header
 *  per request would land in a fresh rate-limit bucket every time. */
export function clientIp(headers: Headers): string {
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;
  const xff = headers.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
  return xff[xff.length - 1] || 'unknown';
}
