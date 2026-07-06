import { createHash } from 'crypto';
import { NextRequest, NextResponse, after } from 'next/server';
import { createClient } from '@sanity/client';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';
import { stegaClean } from '@sanity/client/stega';
import { getSiteSettings } from '@/lib/cms';
import { projectId, dataset } from '@/sanity/env';

/** Newsletter signups, provider-agnostic. Which platform (and its list ID)
 *  is chosen in Site settings → Newsletter; the matching API key lives in the
 *  hosting environment:
 *    Mailchimp      MAILCHIMP_API_KEY        (key like xxxx-us21)
 *    Klaviyo        KLAVIYO_API_KEY          (private key, pk_...)
 *    Adobe Marketo  MARKETO_BASE_URL + MARKETO_CLIENT_ID + MARKETO_CLIENT_SECRET
 *    Other/webhook  NEWSLETTER_WEBHOOK_URL   (e.g. a Zapier/Make catch hook)
 *  Adding another provider later = one more case in this file. */

export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** First-party funnel counter: one dayStats.signups tick per successful
 *  subscribe. Runs via after() = post-response, so it can never delay or
 *  fail a signup; missing write token = silent no-op (same as /api/track). */
function countSignup() {
  after(async () => {
    try {
      const token = process.env.SANITY_API_WRITE_TOKEN;
      if (!token) return;
      const day = new Date().toISOString().slice(0, 10);
      const id = `dayStats.${day}`;
      const client = createClient({ projectId, dataset, apiVersion: '2026-07-01', token, useCdn: false });
      await client
        .transaction()
        .createIfNotExists({ _id: id, _type: 'dayStats', day, total: 0 })
        .patch(id, (p) => p.setIfMissing({ signups: 0 }).inc({ signups: 1 }))
        .commit({ visibility: 'async', returnDocuments: false });
    } catch {
      /* analytics must never surface an error to the signup flow */
    }
  });
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  if (!rateLimit(`nl:${clientIp(req.headers)}`, 5, 60000)) {
    return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 });
  }
  let email = '';
  let honeypot = '';
  try {
    const body = await req.json();
    email = String(body?.email ?? '').trim().toLowerCase();
    honeypot = String(body?.company ?? '');
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-request' }, { status: 400 });
  }
  if (honeypot) return NextResponse.json({ ok: true }); // bots think they won
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: 'invalid-email' }, { status: 400 });

  const s = await getSiteSettings();
  if (s?.newsletterEnabled !== true) return NextResponse.json({ ok: false, error: 'disabled' }, { status: 404 });
  const provider = stegaClean(s?.newsletterProvider) || '';
  const listId = stegaClean(s?.newsletterListId) || '';

  try {
    if (provider === 'mailchimp') {
      const key = process.env.MAILCHIMP_API_KEY;
      const dc = key?.split('-')[1];
      if (!key || !dc || !listId) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
      const hash = createHash('md5').update(email).digest('hex');
      const r = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`, {
        method: 'PUT',
        headers: {
          Authorization: `Basic ${Buffer.from(`any:${key}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_address: email, status_if_new: 'pending' }),
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok) throw new Error(`mailchimp ${r.status}`);
      countSignup();
      return NextResponse.json({ ok: true });
    }

    if (provider === 'klaviyo') {
      const key = process.env.KLAVIYO_API_KEY;
      if (!key || !listId) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
      const r = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs', {
        method: 'POST',
        headers: {
          Authorization: `Klaviyo-API-Key ${key}`,
          'Content-Type': 'application/vnd.api+json',
          revision: '2024-10-15',
        },
        body: JSON.stringify({
          data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
              profiles: {
                data: [{ type: 'profile', attributes: { email, subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } } } }],
              },
            },
            relationships: { list: { data: { type: 'list', id: listId } } },
          },
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok && r.status !== 202) throw new Error(`klaviyo ${r.status}`);
      countSignup();
      return NextResponse.json({ ok: true });
    }

    if (provider === 'marketo') {
      const base = process.env.MARKETO_BASE_URL;
      const id = process.env.MARKETO_CLIENT_ID;
      const secret = process.env.MARKETO_CLIENT_SECRET;
      if (!base || !id || !secret) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
      const tokenRes = await fetch(
        `${base}/identity/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}`,
        { signal: AbortSignal.timeout(15000) }
      );
      const token = (await tokenRes.json())?.access_token;
      if (!token) throw new Error('marketo auth');
      const leadRes = await fetch(`${base}/rest/v1/leads.json`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createOrUpdate', lookupField: 'email', input: [{ email }] }),
        signal: AbortSignal.timeout(15000),
      });
      const lead = await leadRes.json();
      const leadId = lead?.result?.[0]?.id;
      if (!lead?.success) throw new Error('marketo lead');
      if (listId && leadId) {
        await fetch(`${base}/rest/v1/lists/${listId}/leads.json?id=${leadId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(15000),
        });
      }
      countSignup();
      return NextResponse.json({ ok: true });
    }

    if (provider === 'webhook') {
      const url = process.env.NEWSLETTER_WEBHOOK_URL;
      if (!url) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'stroxx-site', at: new Date().toISOString() }),
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok) throw new Error(`webhook ${r.status}`);
      countSignup();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
  } catch {
    return NextResponse.json({ ok: false, error: 'provider-error' }, { status: 502 });
  }
}
