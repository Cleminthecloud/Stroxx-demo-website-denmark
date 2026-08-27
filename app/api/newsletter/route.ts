import { createHash } from 'crypto';
import { NextRequest, NextResponse, after } from 'next/server';
import { createClient } from '@sanity/client';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';
import { stegaClean } from '@sanity/client/stega';
import { getMarkets } from '@/lib/cms';
import { resolveOpsMarket } from '@/lib/markets';
import { resolveSecret } from '@/lib/newsletter-secrets';
import { recordPermission, type PermissionStatus } from '@/lib/permissions';
import { projectId, dataset } from '@/sanity/env';

/** Newsletter signups, provider-agnostic and PER MARKET. Which platform (and
 *  its list ID + encrypted keys) is chosen on the MARKET document (Settings →
 *  Markets). The client POSTs its market code (middleware skips /api, so
 *  headers cannot tell us); it is validated against the market registry via
 *  resolveOpsMarket, and anything missing or bogus falls back to the REFERENCE
 *  market, which normally has no credentials, so a bad code can never reach
 *  another market's list. CMS keys are ciphertext (lib/newsletter-secrets);
 *  the hosting environment can still supply a key as fallback:
 *    Brevo          BREVO_API_KEY            (xkeysib-...)
 *    Mailchimp      MAILCHIMP_API_KEY        (key like xxxx-us21)
 *    Klaviyo        KLAVIYO_API_KEY          (private key, pk_...)
 *    Adobe Marketo  MARKETO_BASE_URL + MARKETO_CLIENT_ID + MARKETO_CLIENT_SECRET
 *    Other/webhook  NEWSLETTER_WEBHOOK_URL   (e.g. a Zapier/Make catch hook)
 *  Adding another provider later = one more case in this file.
 *
 *  TWO STORES, ONE ACT. Every successful signup writes to the email platform
 *  (the sending tool) AND to our own permission record on stroxx.eu (the
 *  proof + the segmentation). The email platform can be swapped; the
 *  permission database cannot, which is exactly why it is ours.
 *  See lib/permissions.ts and docs/STROXX-permission-database.md. */

export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Attributes handed to whichever platform is sending. Same names in every
 *  market so a segment built once works everywhere. Never a price, never a
 *  dealer item number. */
function providerAttributes(m: { code?: string; name?: string; dealerName?: string }, language: string, surface: string) {
  return {
    MARKET: (m.code || 'int').toUpperCase(),
    COUNTRY: (m.code || 'int').toUpperCase(),
    MARKET_NAME: m.name || '',
    PARTNER: m.dealerName || '',
    LANGUAGE: language || '',
    SIGNUP_SURFACE: surface || '',
  };
}

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
  if (!(await rateLimit(`nl:${clientIp(req.headers)}`, 5, 60000))) {
    return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 });
  }
  let email = '';
  let honeypot = '';
  let marketCode: unknown;
  let language = '';
  let sourcePath = '';
  let sourceSurface = '';
  let campaign = '';
  let consentVersion = '';
  let consentText = '';
  let behaviourConsent = false;
  try {
    const body = await req.json();
    email = String(body?.email ?? '').trim().toLowerCase();
    honeypot = String(body?.company ?? '');
    marketCode = body?.market;
    /* Signup context. All of it is untrusted client input, so all of it is
       clamped: it decorates a permission record, it never drives a decision. */
    language = String(body?.language ?? '').slice(0, 8);
    sourcePath = String(body?.sourcePath ?? '').split('?')[0].slice(0, 200);
    sourceSurface = String(body?.surface ?? '').slice(0, 40);
    campaign = String(body?.campaign ?? '').slice(0, 80);
    consentVersion = String(body?.consentVersion ?? '').slice(0, 40);
    /* The frozen wording is the evidence, so it is stripped of Sanity's
       invisible stega markers (a signup made from inside the Studio preview
       would otherwise freeze zero-width junk into it) and clamped generously
       rather than tightly: truncating evidence stores something that is not
       what was shown. 2000 characters is far beyond any real consent line, and
       the CMS field warns before it gets close. */
    consentText = stegaClean(String(body?.consentText ?? '')).slice(0, 2000);
    behaviourConsent = body?.behaviourConsent === true;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-request' }, { status: 400 });
  }
  if (honeypot) return NextResponse.json({ ok: true }); // bots think they won
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: 'invalid-email' }, { status: 400 });

  /* Provider config from the market doc the client claims (validated), else
     the reference market (normally unconfigured, so this fails closed). */
  const s = resolveOpsMarket(marketCode, await getMarkets());
  if (s?.newsletterEnabled !== true) return NextResponse.json({ ok: false, error: 'disabled' }, { status: 404 });
  const provider = stegaClean(s?.newsletterProvider) || '';
  const listId = stegaClean(s?.newsletterListId) || '';
  const market = {
    code: stegaClean(s?.code) || 'int',
    name: stegaClean(s?.name) || '',
    dealerName: stegaClean(s?.dealerName) || '',
  };
  const attributes = providerAttributes(market, language, sourceSurface);

  /* Written after the provider call succeeds, so a permission record only ever
     exists for a signup the platform actually accepted.
     `status` is per provider and honest about it: 'pending' where the platform
     runs double opt-in and the link has not been clicked, 'confirmed' where the
     platform made the contact live immediately. Only 'confirmed' is mailable.
     NO COOKIE IS ISSUED HERE. This endpoint is public, so a signup proves
     nothing about who is holding the browser; the interest cookie is issued by
     /api/newsletter/confirm, against a keyed token. See lib/permissions.ts. */
  const succeed = async (status: PermissionStatus, providerId?: string) => {
    countSignup();
    await recordPermission({
      email,
      market: market.code,
      marketName: market.name,
      partner: market.dealerName,
      language,
      newsletterConsent: true,
      behaviourConsent,
      consentVersion,
      consentText,
      sourcePath,
      sourceSurface,
      campaign,
      consentIp: clientIp(req.headers),
      userAgent: req.headers.get('user-agent') || '',
      provider,
      providerId,
      status,
    });
    return NextResponse.json({ ok: true });
  };

  try {
    if (provider === 'brevo') {
      const key = resolveSecret(s?.brevoApiKey, process.env.BREVO_API_KEY);
      if (!key || !listId) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
      const list = Number(stegaClean(String(s?.newsletterListId ?? '')));
      if (!Number.isFinite(list)) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
      const templateId = Number(stegaClean(String(s?.brevoDoubleOptInTemplateId ?? '')) || 0);
      const redirectionUrl = stegaClean(s?.brevoRedirectUrl) || '';
      /* Double opt-in when a template is configured, which it should be in
         every market: Denmark and Germany both put the burden of proving
         consent on the sender, and a confirmed click is what discharges it.
         Without a template we fall back to a plain contact create, which is
         only defensible where a market has a documented reason.
         Brevo REQUIRES redirectionUrl on the double opt-in endpoint, so a
         template with no landing page would 400 on every signup. Falling back
         is better than failing every visitor, and the missing setting is
         visible in the market's connection status. */
      const doi = templateId > 0 && !!redirectionUrl;
      if (templateId > 0 && !redirectionUrl) {
        console.warn(`[newsletter] market ${market.code}: Brevo double opt-in template set but no confirmation landing page; falling back to a direct contact create`);
      }
      const url = doi ? 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation' : 'https://api.brevo.com/v3/contacts';
      const body = doi
        ? { email, includeListIds: [list], templateId, redirectionUrl, attributes }
        : { email, listIds: [list], updateEnabled: true, attributes };
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'api-key': key, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });
      /* 201 created, 204 confirmation sent. 400 with duplicate_parameter means
         the address is already on the list, which is a success from the
         visitor's point of view and must not look like an error. */
      if (!r.ok && r.status !== 204) {
        const txt = await r.text().catch(() => '');
        if (!/duplicate_parameter|Contact already exist/i.test(txt)) throw new Error(`brevo ${r.status}`);
      }
      /* DOI: pending until the link is clicked. No DOI: the contact is live at
         Brevo the moment it is created, so say so rather than leaving a
         mailable subscriber marked pending forever. */
      return await succeed(doi ? 'pending' : 'confirmed');
    }

    if (provider === 'mailchimp') {
      const key = resolveSecret(s?.mailchimpApiKey, process.env.MAILCHIMP_API_KEY);
      const dc = key?.split('-')[1];
      if (!key || !dc || !listId) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
      const hash = createHash('md5').update(email).digest('hex');
      const r = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`, {
        method: 'PUT',
        headers: {
          Authorization: `Basic ${Buffer.from(`any:${key}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_address: email, status_if_new: 'pending', merge_fields: attributes }),
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok) throw new Error(`mailchimp ${r.status}`);
      /* status_if_new: 'pending' means Mailchimp sends its own confirmation. */
      return await succeed('pending', hash);
    }

    if (provider === 'klaviyo') {
      const key = resolveSecret(s?.klaviyoApiKey, process.env.KLAVIYO_API_KEY);
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
                data: [
                  {
                    type: 'profile',
                    attributes: {
                      email,
                      properties: attributes,
                      subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
                    },
                  },
                ],
              },
            },
            relationships: { list: { data: { type: 'list', id: listId } } },
          },
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok && r.status !== 202) throw new Error(`klaviyo ${r.status}`);
      /* Klaviyo is told SUBSCRIBED outright, so the contact is mailable now. */
      return await succeed('confirmed');
    }

    if (provider === 'marketo') {
      const base = stegaClean(s?.marketoBaseUrl)?.trim() || process.env.MARKETO_BASE_URL;
      const id = resolveSecret(s?.marketoClientId, process.env.MARKETO_CLIENT_ID);
      const secret = resolveSecret(s?.marketoClientSecret, process.env.MARKETO_CLIENT_SECRET);
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
        body: JSON.stringify({
          action: 'createOrUpdate',
          lookupField: 'email',
          input: [{ email, country: attributes.COUNTRY, stroxxMarket: attributes.MARKET_NAME, stroxxPartner: attributes.PARTNER }],
        }),
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
      return await succeed('confirmed', leadId ? String(leadId) : undefined);
    }

    if (provider === 'webhook') {
      const url = resolveSecret(s?.newsletterWebhookUrl, process.env.NEWSLETTER_WEBHOOK_URL);
      if (!url) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'stroxx-site', at: new Date().toISOString(), ...attributes }),
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok) throw new Error(`webhook ${r.status}`);
      /* Whatever is on the far end of the hook decides; we cannot claim a
         confirmation we did not see, but we can say the contact went live. */
      return await succeed('confirmed');
    }

    return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
  } catch {
    return NextResponse.json({ ok: false, error: 'provider-error' }, { status: 502 });
  }
}
