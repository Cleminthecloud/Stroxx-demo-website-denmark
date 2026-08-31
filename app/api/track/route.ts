import { NextRequest, NextResponse, after } from 'next/server';
import { createClient } from '@sanity/client';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sameOrigin } from '@/lib/same-origin';
import { CONSENT_COOKIE, recordInterest } from '@/lib/permissions';
import { projectId, dataset } from '@/sanity/env';

/** First-party analytics collector, in two clearly separated halves.
 *
 *  1. ANONYMOUS COUNTERS, for everyone. No cookies, no user IDs, no
 *     fingerprints: only counts per day (pageviews per path, traffic sources,
 *     outbound clicks to the partner webshops), so it needs no consent banner.
 *     Events land as one `dayStats` document per day in the content dataset
 *     (invisible in the Studio's Content list; the Dashboard tab reads them).
 *
 *  2. NAMED INTEREST SIGNALS, only for people who asked for them. If, and only
 *     if, the visitor carries the first-party permission cookie AND their
 *     permission record still says behaviourConsent is true, the product or
 *     category they viewed is added to THEIR record. The cookie is only a
 *     pointer: lib/permissions re-reads the record and refuses if consent has
 *     since been withdrawn. Withdrawing consent erases the history it made.
 *     Nothing in half 2 can affect half 1, and half 2 never runs for a visitor
 *     who has not signed up and ticked the box.
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
   what a flooder posts (everything else lands in the 'other' bucket).
   The optional leading segment is the market code (/dk, /de, ...): without it
   every localised pageview fell into 'other', and the interest-signal regexes
   below (which do accept the prefix) disagreed with this one. */
const KNOWN_PATH =
  /^\/([a-z]{2,5}(\/|$))?($|products|product\/[a-z0-9-]+|category\/[a-z0-9-]+|stores|monthly(\/(archive|20\d\d-\d\d))?|try-it|satisfaction-guarantee|service|trades(\/[a-z0-9-]+)?|news(\/[a-z0-9-]+)?|campaign\/[a-z0-9\/-]+|support(\/[a-z0-9-]+)?|privacy|cookies|terms|brand)$/;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return new NextResponse(null, { status: 204 });
  if (!(await rateLimit(`trk:${clientIp(req.headers)}`, 60, 60000))) return new NextResponse(null, { status: 204 });
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    console.warn('[track] SANITY_API_WRITE_TOKEN missing; analytics collection disabled');
    return new NextResponse(null, { status: 204 });
  }

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

  /* Half 2: the named interest signal. Runs post-response via after(), so it
     can never slow a pageview, and it is skipped entirely for the vast
     majority of visitors, who carry no permission cookie. */
  const pid = req.cookies.get(CONSENT_COOKIE)?.value;
  if (pid && t === 'pv') {
    const clean = path.split('?')[0];
    const product = /^\/(?:[a-z]{2,5}\/)?product\/([a-z0-9-]+)$/.exec(clean);
    const category = /^\/(?:[a-z]{2,5}\/)?category\/([a-z0-9-]+)$/.exec(clean);
    const hit = product ?? category;
    if (hit) {
      const kind = product ? 'product' : 'category';
      after(() => recordInterest(pid, hit[1], kind));
    }
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

    /* inc() fails on a key that does not exist yet, and every counter key is
       missing on its first hit of the day, so each incremented key must be
       seeded with 0 in the same patch (setIfMissing applies before inc) */
    for (const k of Object.keys(inc)) setIfMissing[k] = 0;

    await client
      .transaction()
      .createIfNotExists({ _id: id, _type: 'dayStats', day, total: 0 })
      .patch(id, (p) => {
        let q = p.setIfMissing(setIfMissing).inc(inc);
        if (Object.keys(set).length) q = q.set(set);
        return q;
      })
      .commit({ visibility: 'async', returnDocuments: false });
  } catch (err) {
    /* analytics must never surface an error to the site, but it must be
       visible to operators: this line is what appears in the hosting
       provider's function logs when writes fail (bad token, wrong dataset) */
    const e = err as { statusCode?: number; message?: string };
    console.error('[track] dayStats write failed:', e?.statusCode ?? '', e?.message ?? err);
  }
  return new NextResponse(null, { status: 204 });
}
