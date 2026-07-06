import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';
import { stegaClean } from '@sanity/client/stega';
import { getSiteSettings } from '@/lib/cms';

/** Connection status for the Site settings newsletter tab: is the chosen
 *  provider's API key present in the hosting environment, and does the
 *  provider answer? Never returns key material or provider error bodies,
 *  only a traffic-light status. Result cached per instance for 60s so the
 *  Studio can't hammer the providers. */

export const maxDuration = 15;

type Status = {
  provider: string;
  enabled: boolean;
  listConfigured: boolean;
  status: 'connected' | 'key-missing' | 'error' | 'not-selected' | 'not-pinged';
  checkedAt: string;
};

let cache: { at: number; value: Status } | null = null;

async function check(): Promise<Status> {
  const s = await getSiteSettings();
  const provider = stegaClean(s?.newsletterProvider) || '';
  const base: Omit<Status, 'status'> = {
    provider,
    enabled: s?.newsletterEnabled === true,
    listConfigured: Boolean(stegaClean(s?.newsletterListId)),
    checkedAt: new Date().toISOString(),
  };
  const t = AbortSignal.timeout(8000);

  try {
    if (provider === 'mailchimp') {
      const key = process.env.MAILCHIMP_API_KEY;
      const dc = key?.split('-')[1];
      if (!key || !dc) return { ...base, status: 'key-missing' };
      const r = await fetch(`https://${dc}.api.mailchimp.com/3.0/ping`, {
        headers: { Authorization: `Basic ${Buffer.from(`any:${key}`).toString('base64')}` },
        signal: t,
      });
      return { ...base, status: r.ok ? 'connected' : 'error' };
    }
    if (provider === 'klaviyo') {
      const key = process.env.KLAVIYO_API_KEY;
      if (!key) return { ...base, status: 'key-missing' };
      const r = await fetch('https://a.klaviyo.com/api/lists/?page[size]=1', {
        headers: { Authorization: `Klaviyo-API-Key ${key}`, revision: '2024-10-15' },
        signal: t,
      });
      return { ...base, status: r.ok ? 'connected' : 'error' };
    }
    if (provider === 'marketo') {
      const basePath = process.env.MARKETO_BASE_URL;
      const id = process.env.MARKETO_CLIENT_ID;
      const secret = process.env.MARKETO_CLIENT_SECRET;
      if (!basePath || !id || !secret) return { ...base, status: 'key-missing' };
      const r = await fetch(
        `${basePath}/identity/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}`,
        { signal: t }
      );
      const ok = r.ok && Boolean((await r.json())?.access_token);
      return { ...base, status: ok ? 'connected' : 'error' };
    }
    if (provider === 'webhook') {
      /* catch hooks are POST-only; presence is the only safe check */
      return { ...base, status: process.env.NEWSLETTER_WEBHOOK_URL ? 'not-pinged' : 'key-missing' };
    }
    return { ...base, status: 'not-selected' };
  } catch {
    return { ...base, status: 'error' };
  }
}

export async function GET(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!(await rateLimit(`nls:${clientIp(req.headers)}`, 10, 60000))) {
    return NextResponse.json({ error: 'rate-limited' }, { status: 429 });
  }
  if (cache && Date.now() - cache.at < 60000) return NextResponse.json(cache.value);
  const value = await check();
  cache = { at: Date.now(), value };
  return NextResponse.json(value);
}
