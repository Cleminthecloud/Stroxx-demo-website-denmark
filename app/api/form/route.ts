import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';

/** Contact-form submissions (the "Contact form" landing block). Generic by
 *  design: everything POSTs as JSON to FORM_WEBHOOK_URL in the hosting
 *  environment (a Zapier/Make/Power Automate hook into the client's inbox or
 *  CRM). No webhook configured → 503 and the form shows its call-us fallback.
 *  Same protections as the newsletter: rate limit + honeypot. */

export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  if (!rateLimit(`form:${clientIp(req.headers)}`, 5, 60000)) {
    return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 });
  }
  let name = '', email = '', phone = '', message = '', topic = '', honeypot = '';
  try {
    const body = await req.json();
    name = String(body?.name ?? '').trim().slice(0, 200);
    email = String(body?.email ?? '').trim().toLowerCase().slice(0, 200);
    phone = String(body?.phone ?? '').trim().slice(0, 50);
    message = String(body?.message ?? '').trim().slice(0, 4000);
    topic = String(body?.topic ?? '').trim().slice(0, 100);
    honeypot = String(body?.company ?? '');
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-request' }, { status: 400 });
  }
  if (honeypot) return NextResponse.json({ ok: true }); // bots think they won
  if (!name || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
  }

  const hook = process.env.FORM_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });

  try {
    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'stroxx-site-contact-form',
        topic,
        name,
        email,
        phone,
        message,
        submittedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Error(String(r.status));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
  }
}
