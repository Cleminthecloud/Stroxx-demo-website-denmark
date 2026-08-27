import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import {
  CONSENT_COOKIE,
  confirmPermission,
  permissionTokenValid,
  withdrawPermission,
} from '@/lib/permissions';

/** Double opt-in confirmation and withdrawal for the permission database.
 *
 *  A link in an email hits this route, so it is a GET and it cannot rely on
 *  the same-origin guard the POST endpoints use. What it relies on instead is
 *  a KEYED token: `id` names the record, `t` is an HMAC of that ID under
 *  NEWSLETTER_SECRET_KEY, which only the server holds. The record ID itself is
 *  derived from the address and is therefore guessable; the token is not.
 *  Without the key configured, `permissionToken` returns null and every
 *  request here fails closed.
 *
 *  Confirming is the ONLY thing that makes a record mailable, and the only
 *  place the browser is handed the interest cookie: at this point the person
 *  has demonstrably opened mail sent to their own address, which a public
 *  signup form can never demonstrate.
 *
 *  `action=withdraw` closes the permission and erases every behavioural signal,
 *  and clears the cookie in the same response.
 *
 *  NOT YET WIRED TO A PROVIDER. Brevo runs its own double opt-in and redirects
 *  to a plain landing page, carrying no token of ours, so today this route
 *  serves our own confirmation links and the future Brevo webhook. Until that
 *  webhook exists, a Brevo double opt-in click is confirmed at Brevo and stays
 *  'pending' here. That gap is deliberate and documented rather than papered
 *  over with a guessable link. See docs/STROXX-permission-database.md. */

export const maxDuration = 15;

const ID_RE = /^permission\.[a-f0-9]{32}$/;
const TOKEN_RE = /^[a-f0-9]{32}$/;

export async function GET(req: NextRequest) {
  if (!(await rateLimit(`nlc:${clientIp(req.headers)}`, 10, 60000))) {
    return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id') || '';
  const token = url.searchParams.get('t') || '';
  const action = url.searchParams.get('action') === 'withdraw' ? 'withdraw' : 'confirm';

  /* Shape first, so a malformed value never reaches the comparison. */
  if (!ID_RE.test(id) || !TOKEN_RE.test(token) || !permissionTokenValid(id, token)) {
    return NextResponse.json({ ok: false, error: 'invalid-link' }, { status: 400 });
  }

  if (action === 'withdraw') {
    const done = await withdrawPermission(id);
    const res = NextResponse.json({ ok: done });
    res.cookies.delete(CONSENT_COOKIE);
    return res;
  }

  const done = await confirmPermission(id);
  const res = NextResponse.json({ ok: done });
  /* The interest cookie is issued here and nowhere else. It points at a record
     whose owner has just proved control of the address; lib/permissions still
     re-reads the record before every write, so the cookie is a pointer, never
     an authority. */
  if (done) {
    res.cookies.set(CONSENT_COOKIE, id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  return res;
}
