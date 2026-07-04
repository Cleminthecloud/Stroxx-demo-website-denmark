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

export const maxDuration = 15;

const KINDS = ['bug', 'idea', 'other'] as const;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  if (!rateLimit(`fb:${clientIp(req.headers)}`, 5, 60000)) {
    return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 });
  }

  let message = '', page = '', reporter = '', email = '', kind = '', device = '', honeypot = '';
  try {
    const b = await req.json();
    message = String(b?.message ?? '').trim().slice(0, 4000);
    page = String(b?.page ?? '').trim().slice(0, 300);
    reporter = String(b?.name ?? '').trim().slice(0, 120);
    email = String(b?.email ?? '').trim().slice(0, 200);
    kind = String(b?.kind ?? 'bug');
    device = String(b?.device ?? '').slice(0, 300);
    honeypot = String(b?.company ?? '');
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
    await client.create(
      { _type: 'feedback', status: 'new', kind, message, page, reporter, email, device },
      { visibility: 'async' }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
  }
}
