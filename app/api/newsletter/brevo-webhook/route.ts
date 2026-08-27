import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { stegaClean } from '@sanity/client/stega';
import { getMarkets } from '@/lib/cms';
import { confirmPermission, permissionId, withdrawPermission } from '@/lib/permissions';

/** Brevo marketing webhook: the server-side half of double opt-in.
 *
 *  The primary confirmation path is the redirect: Brevo's confirmation link
 *  comes back through /api/newsletter/confirm carrying a keyed token, which is
 *  what marks the record confirmed and issues the interest cookie. This route
 *  is the BACKSTOP, for the person whose browser never completed that redirect,
 *  and it is the ONLY path for unsubscribes, which happen at Brevo and would
 *  otherwise never reach our record. Without it, someone who unsubscribes at
 *  Brevo stays "confirmed" here, and Article 7(3) withdrawal has no way in.
 *
 *  AUTHENTICATION. Brevo does not sign its webhooks: there is no HMAC, no
 *  signature header, no timestamp. What it offers is sending back a header you
 *  configured yourself, so that is what we check, in constant time, against
 *  BREVO_WEBHOOK_TOKEN. No token configured means this route is off. Configure
 *  it on the Brevo webhook as a custom header:
 *      x-webhook-token: <the same value as BREVO_WEBHOOK_TOKEN>
 *
 *  Because the payload is unsigned, it is treated as an untrusted HINT, never
 *  as fact: nothing here trusts the body's own claim about which list a contact
 *  joined. The list ID is matched against the market registry, and the email is
 *  only ever used to derive a record ID we already know how to compute.
 *
 *  RETURN CODES MATTER HERE. Brevo's retry rules discard a webhook on any 4xx
 *  except 429, and (by its own contradictory docs) possibly on 5xx too. So a
 *  transient failure returns 429, which is the one code that reliably earns a
 *  retry, and everything we have genuinely handled or genuinely cannot use
 *  returns 200 so it is not retried forever.
 *
 *  Payload shapes (developers.brevo.com/docs/marketing-webhooks):
 *    list_addition   { event, email, id, key, list_id: number[], date, ts }
 *    unsubscribe     { event, email, list_id: number[], ... }
 *    contact_deleted { event, email, key, list_id, date, ts }
 *  Note the payload strings differ from the API's event names (listAddition,
 *  unsubscribed, contactDeleted). */

export const maxDuration = 15;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function tokenOk(req: NextRequest): boolean {
  const expected = process.env.BREVO_WEBHOOK_TOKEN;
  if (!expected) return false;
  const got =
    req.headers.get('x-webhook-token') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!got || got.length !== expected.length) return false;
  const enc = new TextEncoder();
  return timingSafeEqual(enc.encode(got), enc.encode(expected));
}

/** Which market owns this Brevo list? The body says which list the contact
 *  joined; we only act if that list is one WE configured, which is what stops
 *  a forged body from touching a record. */
async function marketForList(listIds: number[]): Promise<string | null> {
  const markets = await getMarkets();
  for (const m of markets) {
    const configured = Number(stegaClean(String(m.newsletterListId ?? '')));
    if (Number.isFinite(configured) && listIds.includes(configured)) {
      return stegaClean(m.code) || null;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!process.env.BREVO_WEBHOOK_TOKEN) {
    console.warn('[brevo-webhook] BREVO_WEBHOOK_TOKEN not set; refusing every request');
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  if (!tokenOk(req)) return NextResponse.json({ ok: false }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    /* Malformed is not transient: 200 so Brevo stops rather than retrying. */
    return NextResponse.json({ ok: true, ignored: 'unparseable' });
  }

  const event = String(body?.event ?? '');
  const email = String(body?.email ?? '').trim().toLowerCase();
  const rawLists = Array.isArray(body?.list_id) ? (body.list_id as unknown[]) : [];
  const listIds = rawLists.map(Number).filter((n) => Number.isFinite(n));

  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: true, ignored: 'no-email' });

  let market: string | null;
  try {
    market = await marketForList(listIds);
  } catch {
    /* The market registry was unreachable. That IS transient, so ask for the
       retry rather than silently dropping a consent event. */
    return NextResponse.json({ ok: false, retry: true }, { status: 429 });
  }
  if (!market) return NextResponse.json({ ok: true, ignored: 'unknown-list' });

  const id = permissionId(email, market);

  /* list_addition also fires for bulk imports and multi-contact API adds, so it
     is not proof of a human click on its own. It is safe here because the only
     way an address reaches one of our configured lists is through the double
     opt-in flow, and because confirming an already-confirmed record is a no-op.
     If a market ever starts importing contacts into these lists, this
     assumption breaks and the import must go somewhere else. */
  if (event === 'list_addition') {
    const done = await confirmPermission(id);
    return NextResponse.json({ ok: true, confirmed: done });
  }

  if (event === 'unsubscribe' || event === 'contact_deleted') {
    const done = await withdrawPermission(id);
    return NextResponse.json({ ok: true, withdrawn: done });
  }

  return NextResponse.json({ ok: true, ignored: event || 'no-event' });
}

/** A GET is not part of the contract; it exists so you can confirm the route is
 *  deployed and the secret is set without sending a fake consent event. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(process.env.BREVO_WEBHOOK_TOKEN),
    expects: 'POST with header x-webhook-token',
  });
}
