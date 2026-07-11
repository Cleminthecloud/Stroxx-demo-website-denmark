import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { createClient } from '@sanity/client';
import { projectId, dataset } from '@/sanity/env';

/** Managed QR short links: stroxx.eu/qr/<code>. Each `qrCode` document in
 *  the CMS maps a printed code to a target the editors can change forever
 *  after (no reprints). Every scan is counted into the same anonymous
 *  dayStats documents the Dashboard reads, AFTER the redirect is sent, so
 *  the person scanning never waits for analytics.
 *
 *  302, never 301: phones and scanners must re-ask every time so a
 *  repointed campaign takes effect immediately.
 *  Unknown/inactive codes land on the homepage; a scan never dead-ends. */

export const maxDuration = 10;

const CODE_RE = /^[a-z0-9-]{2,40}$/;
const TTL_MS = 60_000;
let cache: { at: number; map: Map<string, { target: string; active: boolean }> } | null = null;

async function getCodes(): Promise<Map<string, { target: string; active: boolean }>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map;
  const query = encodeURIComponent('*[_type=="qrCode"]{"code": code.current, target, active}');
  const res = await fetch(
    `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`,
    { signal: AbortSignal.timeout(2000) }
  );
  if (!res.ok) return cache?.map ?? new Map();
  const json = (await res.json()) as { result?: { code?: string; target?: string; active?: boolean }[] };
  const map = new Map<string, { target: string; active: boolean }>();
  for (const r of json.result ?? []) {
    if (!r.code || !CODE_RE.test(r.code) || !r.target) continue;
    // stricter than the schema: internal path or https only. Internal targets
    // need a single leading '/' NOT followed by '/' or '\', because
    // '//evil.com' and '/\evil.com' resolve to an external origin in new URL().
    if (!/^\/(?![/\\])[^\s]*$/.test(r.target) && !/^https:\/\/[^\s]+$/.test(r.target)) continue;
    map.set(r.code, { target: r.target, active: r.active !== false });
  }
  cache = { at: Date.now(), map };
  return map;
}

function countScan(code: string) {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return;
  const day = new Date().toISOString().slice(0, 10);
  const id = `dayStats.${day}`;
  const client = createClient({ projectId, dataset, apiVersion: '2026-07-01', token, useCdn: false });
  after(async () => {
    try {
      await client
        .transaction()
        .createIfNotExists({ _id: id, _type: 'dayStats', day, total: 0 })
        .patch(id, (p) => p.setIfMissing({ qr: {} }).inc({ [`qr.${code.replace(/-/g, '_')}`]: 1 }))
        .commit({ visibility: 'async', returnDocuments: false });
    } catch {
      /* counting must never break a scan */
    }
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const home = new URL('/', req.url);
  try {
    const code = (await params).code.toLowerCase();
    if (!CODE_RE.test(code)) return NextResponse.redirect(home, 302);
    const hit = (await getCodes()).get(code);
    if (!hit) return NextResponse.redirect(home, 302);
    countScan(code);
    if (!hit.active) return NextResponse.redirect(home, 302);
    const dest = hit.target.startsWith('/') ? new URL(hit.target, req.url) : new URL(hit.target);
    return NextResponse.redirect(dest, 302);
  } catch {
    return NextResponse.redirect(home, 302);
  }
}
