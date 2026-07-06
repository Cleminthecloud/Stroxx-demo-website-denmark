import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';
import { projectId, dataset } from '@/sanity/env';

/** First-party, privacy-clean analytics collector. No cookies, no user IDs,
 *  no fingerprints: only anonymous counters per day (pageviews per path,
 *  traffic sources, outbound clicks to the partner webshops), so it needs no
 *  consent banner. Events land as one `dayStats` document per day in the
 *  content dataset (invisible in the Studio's Content list; the Dashboard
 *  tab reads them).
 *
 *  Requires SANITY_API_WRITE_TOKEN (an Editor token) in the hosting env.
 *  Missing → 204 no-op, the site never depends on the collector. */

export const maxDuration = 10;

/* referrer/utm → a small, stable set of source buckets */
function bucket(src: string): string {
  const s = src.toLowerCase();
  if (!s) return 'direct';
  if (/linkedin|lnkd\.in/.test(s)) return 'linkedin';
  if (/facebook|fb\.me|instagram/.test(s)) return 'meta';
  if (/twitter|t\.co|^x\.com|\/\/x\./.test(s)) return 'x';
  if (/whatsapp|wa\.me/.test(s)) return 'whatsapp';
  if (/google|bing|duckduckgo|ecosia/.test(s)) return 'search';
  if (/chatgpt|openai|perplexity|claude|anthropic|copilot|gemini/.test(s)) return 'ai_assistants';
  if (/newsletter|mailchimp|klaviyo|marketo|email/.test(s)) return 'email';
  if (/stroxx|vercel\.app/.test(s)) return 'internal';
  return 'other_sites';
}

/* Sanity attribute names must be simple; keep a readable-but-safe key */
const safeKey = (p: string) => (p.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'home').slice(0, 80);

const PARTNERS = ['carl-ras', 'meesenburg', 'foussier', 'lecot'] as const;
const SHARE_CHANNELS = ['native', 'linkedin', 'facebook', 'x', 'whatsapp', 'email', 'copy'] as const;

/* only real routes get counted: bounds the per-day document size no matter
   what a flooder posts (everything else lands in the 'other' bucket) */
const KNOWN_PATH =
  /^\/($|produkter|produkt\/[a-z0-9-]+|butikker|maanedens|proev-det|service|fag(\/[a-z0-9-]+)?|nyheder(\/[a-z0-9-]+)?|kampagne\/[a-z0-9\/-]+|support(\/[a-z0-9-]+)?|privatliv|cookies|handelsbetingelser)$/;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return new NextResponse(null, { status: 204 });
  if (!(await rateLimit(`trk:${clientIp(req.headers)}`, 60, 60000))) return new NextResponse(null, { status: 204 });
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return new NextResponse(null, { status: 204 });

  let t = '', path = '', src = '', to = '', channel = '';
  try {
    const b = await req.json();
    t = String(b?.t ?? '');
    path = String(b?.path ?? '').slice(0, 200);
    src = String(b?.src ?? '').slice(0, 300);
    to = String(b?.to ?? '').slice(0, 40);
    channel = String(b?.channel ?? '').slice(0, 20);
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const day = new Date().toISOString().slice(0, 10);
  const id = `dayStats.${day}`;
  const client = createClient({ projectId, dataset, apiVersion: '2026-07-01', token, useCdn: false });

  try {
    const inc: Record<string, number> = {};
    const setIfMissing: Record<string, unknown> = { total: 0, paths: {}, sources: {}, outbound: {}, shares: {}, pathNames: {} };
    const set: Record<string, string> = {};

    if (t === 'pv' && path.startsWith('/')) {
      const known = KNOWN_PATH.test(path.split('?')[0]);
      const k = known ? safeKey(path.split('?')[0]) : 'other';
      inc['total'] = 1;
      inc[`paths.${k}`] = 1;
      inc[`sources.${bucket(src)}`] = 1;
      if (known) set[`pathNames.${k}`] = path.split('?')[0];
    } else if (t === 'out' && (PARTNERS as readonly string[]).includes(to)) {
      inc[`outbound.${to.replace('-', '_')}`] = 1;
    } else if (t === 'share' && (SHARE_CHANNELS as readonly string[]).includes(channel)) {
      inc[`shares.${channel}`] = 1;
    } else {
      return new NextResponse(null, { status: 204 });
    }

    await client
      .transaction()
      .createIfNotExists({ _id: id, _type: 'dayStats', day, total: 0 })
      .patch(id, (p) => {
        let q = p.setIfMissing(setIfMissing).inc(inc);
        if (Object.keys(set).length) q = q.set(set);
        return q;
      })
      .commit({ visibility: 'async', returnDocuments: false });
  } catch {
    /* analytics must never surface an error to the site */
  }
  return new NextResponse(null, { status: 204 });
}
