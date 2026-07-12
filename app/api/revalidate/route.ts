import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { isValidSignature, SIGNATURE_HEADER } from '@/lib/sanity-webhook';

/** Sanity publish webhook: the missing link between "published in the CMS"
 *  and "visible on the site". CMS fetches are cached with revalidate:false
 *  and the stable 'sanity' tag (sanity/lib/live.ts), so without this route a
 *  publish could sit invisible behind Vercel's data cache indefinitely (it
 *  did, on 2026-07-12, through multiple redeploys).
 *
 *  Setup (one time):
 *   1. SANITY_REVALIDATE_SECRET in .env.local AND Vercel (any long random
 *      string; both sides must match).
 *   2. sanity.io/manage -> project -> API -> Webhooks -> create:
 *      URL https://<site>/api/revalidate, dataset demo, trigger on
 *      create + update + delete, projection {_type}, secret = same value.
 *
 *  Security: HMAC signature required (lib/sanity-webhook.ts, test-locked).
 *  No secret configured = fail closed. The route only expires caches, so a
 *  replayed delivery is harmless. */

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ error: 'not-configured' }, { status: 503 });

  const body = await req.text();
  if (!isValidSignature(body, req.headers.get(SIGNATURE_HEADER), secret)) {
    return NextResponse.json({ error: 'invalid-signature' }, { status: 401 });
  }

  let type = 'unknown';
  try {
    type = JSON.parse(body)?._type ?? 'unknown';
  } catch {
    /* body is optional context, not required for the expiry */
  }

  /* the data cache (every sanityFetch carries the 'sanity' tag) ... */
  revalidateTag('sanity', 'max');
  /* ... and the full route cache, so static shells re-render with the fresh data */
  revalidatePath('/', 'layout');

  console.log(`[revalidate] expired sanity caches (publish: ${type})`);
  return NextResponse.json({ revalidated: true, type });
}
