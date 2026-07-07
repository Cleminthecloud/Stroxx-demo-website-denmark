import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';
import { projectId, dataset } from '@/sanity/env';

/** Test-page feedback: each submission becomes a `feedback` document in the
 *  content dataset, reviewed and triaged in the Studio (status workflow).
 *  Same hardening as the other POST endpoints: same-origin, per-IP rate
 *  limit, honeypot, hard length caps. Uses the same SANITY_API_WRITE_TOKEN
 *  as the analytics collector; missing token → 503 and the form shows its
 *  email fallback. */

export const maxDuration = 30;

const KINDS = ['bug', 'idea', 'other'] as const;

/* screenshots arrive as data URLs (the form downscales them first); keep well
   under Vercel's ~4.5MB body cap. Up to MAX_IMAGES per report, each guarded. */
const IMG_RE = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/;
const IMG_MAX_BYTES = 3 * 1024 * 1024;
const MAX_IMAGES = 4;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  if (!(await rateLimit(`fb:${clientIp(req.headers)}`, 5, 60000))) {
    return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 });
  }

  let message = '', page = '', reporter = '', email = '', kind = '', device = '', honeypot = '';
  let images: string[] = [];
  try {
    const b = await req.json();
    message = String(b?.message ?? '').trim().slice(0, 4000);
    page = String(b?.page ?? '').trim().slice(0, 300);
    reporter = String(b?.name ?? '').trim().slice(0, 120);
    email = String(b?.email ?? '').trim().slice(0, 200);
    kind = String(b?.kind ?? 'bug');
    device = String(b?.device ?? '').slice(0, 300);
    honeypot = String(b?.company ?? '');
    // Accept an images[] array; fall back to a single `image` for older clients.
    images = Array.isArray(b?.images)
      ? b.images.map((x: unknown) => String(x ?? '')).filter(Boolean).slice(0, MAX_IMAGES)
      : b?.image
      ? [String(b.image)]
      : [];
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-request' }, { status: 400 });
  }
  if (honeypot) return NextResponse.json({ ok: true }); // bots think they won
  if (!message) return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
  if (!(KINDS as readonly string[]).includes(kind)) kind = 'other';

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });

  const client = createClient({ projectId, dataset, apiVersion: '2026-07-01', token, useCdn: false });
  try {
    /* optional screenshots: each strictly validated data URL → Sanity image
       asset. A bad/oversized image never sinks the report; it is dropped. */
    type ImageRef = { _type: 'image'; _key: string; asset: { _type: 'reference'; _ref: string } };
    const screenshots: ImageRef[] = [];
    for (let i = 0; i < images.length && screenshots.length < MAX_IMAGES; i++) {
      const m = IMG_RE.exec(images[i]);
      if (!m) continue;
      const buf = Buffer.from(m[2], 'base64');
      if (buf.byteLength === 0 || buf.byteLength > IMG_MAX_BYTES) continue;
      try {
        const asset = await client.assets.upload('image', buf, {
          filename: `feedback-${Date.now()}-${i + 1}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`,
          contentType: `image/${m[1]}`,
        });
        screenshots.push({ _type: 'image', _key: `shot-${i}-${asset._id.slice(-6)}`, asset: { _type: 'reference', _ref: asset._id } });
      } catch {
        /* drop this image, keep the report and the others */
      }
    }
    // `screenshot` (first) kept for back-compat + the list thumbnail; the full
    // set lives in `screenshots`.
    const first = screenshots[0] ? { _type: 'image' as const, asset: screenshots[0].asset } : undefined;

    await client.create(
      {
        _type: 'feedback',
        status: 'new',
        kind,
        message,
        page,
        reporter,
        email,
        device,
        ...(first ? { screenshot: first } : {}),
        ...(screenshots.length ? { screenshots } : {}),
      },
      { visibility: 'async' }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
  }
}
