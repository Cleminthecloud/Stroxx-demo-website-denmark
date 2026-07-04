'use client';

import { useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';

/** "Dashboard" Studio tab: the site's own first-party numbers, collected by
 *  /api/track (anonymous day counters, no cookies). The goal is to teach a
 *  team new to analytics how traffic, content and partner clicks connect:
 *  daily visits, where visitors come from (incl. social shares and AI
 *  assistants), what they read, article performance, and clicks out to the
 *  partner webshops. One button turns any period into a shareable report. */

type Day = {
  _id: string;
  day: string;
  total?: number;
  paths?: Record<string, number>;
  pathNames?: Record<string, string>;
  sources?: Record<string, number>;
  outbound?: Record<string, number>;
  shares?: Record<string, number>;
};

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct (typed / bookmark)',
  linkedin: 'LinkedIn',
  meta: 'Facebook / Instagram',
  x: 'X (Twitter)',
  whatsapp: 'WhatsApp',
  search: 'Search (Google etc.)',
  ai_assistants: 'AI assistants',
  email: 'Email / newsletter',
  internal: 'Internal navigation',
  other_sites: 'Other websites',
};

const PARTNER_LABELS: Record<string, string> = {
  carl_ras: 'Carl Ras (DK)',
  meesenburg: 'Meesenburg (DE)',
  foussier: 'Foussier (FR)',
  lecot: 'Lecot (BE)',
};

const SHARE_LABELS: Record<string, string> = {
  native: 'Native share sheet',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  whatsapp: 'WhatsApp',
  email: 'Email',
  copy: 'Copied link',
};

const PERIODS = [7, 30, 90] as const;

function mergeCounts(days: Day[], field: 'paths' | 'sources' | 'outbound' | 'shares'): [string, number][] {
  const acc: Record<string, number> = {};
  for (const d of days)
    for (const [k, v] of Object.entries(d[field] ?? {})) acc[k] = (acc[k] ?? 0) + (typeof v === 'number' ? v : 0);
  return Object.entries(acc).sort((a, b) => b[1] - a[1]);
}

function pathName(days: Day[], key: string): string {
  for (const d of days) {
    const n = d.pathNames?.[key];
    if (n) return n;
  }
  return '/' + key.replace(/_/g, '/');
}

export default function DashboardTool() {
  const client = useClient({ apiVersion: '2026-07-01' });
  const [all, setAll] = useState<Day[]>([]);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(7);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    client
      .fetch<Day[]>(`*[_type == "dayStats"] | order(day desc)[0...120]`)
      .then((r) => setAll(r || []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, [client]);

  const days = useMemo(() => {
    const cutoff = new Date(Date.now() - period * 86400000).toISOString().slice(0, 10);
    return all.filter((d) => d.day >= cutoff);
  }, [all, period]);

  const total = days.reduce((a, d) => a + (d.total ?? 0), 0);
  const paths = useMemo(() => mergeCounts(days, 'paths'), [days]);
  const sources = useMemo(() => mergeCounts(days, 'sources'), [days]);
  const outbound = useMemo(() => mergeCounts(days, 'outbound'), [days]);
  const shares = useMemo(() => mergeCounts(days, 'shares'), [days]);
  const articles = useMemo(() => paths.filter(([k]) => k.startsWith('nyheder')), [paths]);
  const social = sources.filter(([k]) => ['linkedin', 'meta', 'x', 'whatsapp'].includes(k)).reduce((a, [, v]) => a + v, 0);

  /* daily bars, oldest → newest */
  const series = useMemo(() => {
    const map = new Map(days.map((d) => [d.day, d.total ?? 0]));
    const out: { day: string; n: number }[] = [];
    for (let i = period - 1; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      out.push({ day, n: map.get(day) ?? 0 });
    }
    return out;
  }, [days, period]);
  const maxDay = Math.max(1, ...series.map((s) => s.n));

  const report = () => {
    const L: string[] = [];
    L.push(`# STROXX site report, last ${period} days (${new Date().toISOString().slice(0, 10)})`);
    L.push('');
    L.push(`Total pageviews: ${total}`);
    L.push(`From social shares (LinkedIn, Meta, X, WhatsApp): ${social}`);
    L.push('');
    L.push('## Where visitors came from');
    for (const [k, v] of sources) L.push(`- ${SOURCE_LABELS[k] ?? k}: ${v}`);
    L.push('');
    L.push('## Most read pages');
    for (const [k, v] of paths.slice(0, 12)) L.push(`- ${pathName(days, k)}: ${v}`);
    if (articles.length) {
      L.push('');
      L.push('## Articles');
      for (const [k, v] of articles) L.push(`- ${pathName(days, k)}: ${v}`);
    }
    L.push('');
    L.push('## Shares from the article pages (by channel)');
    if (shares.length === 0) L.push('- none in this period');
    for (const [k, v] of shares) L.push(`- ${SHARE_LABELS[k] ?? k}: ${v}`);
    L.push('');
    L.push('## Clicks out to partner webshops');
    if (outbound.length === 0) L.push('- none in this period');
    for (const [k, v] of outbound) L.push(`- ${PARTNER_LABELS[k] ?? k}: ${v}`);
    L.push('');
    L.push('The customer journey to watch: source → article or landing page → product page → click to the partner webshop.');
    return L.join('\n');
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const S = {
    wrap: { maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' } as const,
    row: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' } as const,
    pill: (on: boolean) =>
      ({
        padding: '7px 14px', borderRadius: 999,
        border: on ? '1px solid #2276fc' : '1px solid rgba(128,128,128,0.35)',
        background: on ? 'rgba(34,118,252,0.12)' : 'transparent',
        color: 'inherit', cursor: 'pointer', fontSize: 13, fontWeight: on ? 600 : 400,
      }) as const,
    grid: { display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginTop: 20 } as const,
    card: { border: '1px solid rgba(128,128,128,0.3)', borderRadius: 12, padding: 18 } as const,
    h: { fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
    big: { fontSize: 34, fontWeight: 700, lineHeight: 1 } as const,
    barRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 7 } as const,
    bar: (w: number) => ({ height: 8, width: `${Math.max(2, w)}%`, background: '#2276fc', borderRadius: 4, opacity: 0.85 }) as const,
    ghost: { padding: '9px 18px', borderRadius: 999, border: '1px solid rgba(128,128,128,0.4)', background: 'transparent', color: 'inherit', fontSize: 13, cursor: 'pointer' } as const,
  };

  const List = ({ rows, labels, empty }: { rows: [string, number][]; labels?: Record<string, string>; empty: string }) => {
    const max = Math.max(1, ...rows.map(([, v]) => v));
    if (!rows.length) return <p style={{ fontSize: 13, opacity: 0.6 }}>{empty}</p>;
    return (
      <div>
        {rows.slice(0, 10).map(([k, v]) => (
          <div key={k} style={S.barRow}>
            <span style={{ width: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {labels ? labels[k] ?? k : pathName(days, k)}
            </span>
            <div style={S.bar((v / max) * 100)} />
            <span style={{ opacity: 0.7 }}>{v}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={S.wrap}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 18, lineHeight: 1.5, maxWidth: 640 }}>
        The site&#39;s own numbers, counted anonymously (no cookies, so no consent needed and no setup).
        The journey to watch: <strong>source → article or landing page → product page → partner webshop</strong>.
        When you share an article on LinkedIn, watch the LinkedIn source and the article&#39;s reads move the next day.
      </p>

      <div style={S.row}>
        {PERIODS.map((p) => (
          <button key={p} style={S.pill(period === p)} onClick={() => setPeriod(p)}>Last {p} days</button>
        ))}
        <button style={S.ghost} onClick={copyReport}>{copied ? 'Report copied ✓' : 'Copy report'}</button>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, opacity: 0.7, marginTop: 20 }}>Loading…</p>
      ) : all.length === 0 ? (
        <div style={{ ...S.card, marginTop: 20 }}>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            No data yet. The collector starts counting as soon as the site gets its first visit
            (and the SANITY_API_WRITE_TOKEN is set in the hosting environment). Come back after
            some traffic, or open the site in another tab and refresh here.
          </p>
        </div>
      ) : (
        <>
          <div style={S.grid}>
            <div style={S.card}>
              <div style={S.h}>Pageviews, last {period} days</div>
              <div style={S.big}>{total}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60, marginTop: 16 }}>
                {series.map((s) => (
                  <div key={s.day} title={`${s.day}: ${s.n}`}
                    style={{ flex: 1, height: `${(s.n / maxDay) * 100}%`, minHeight: 2, background: '#2276fc', opacity: 0.8, borderRadius: 2 }} />
                ))}
              </div>
            </div>
            <div style={S.card}>
              <div style={S.h}>From your social shares</div>
              <div style={S.big}>{social}</div>
              <p style={{ fontSize: 12.5, opacity: 0.7, marginTop: 12, lineHeight: 1.5 }}>
                Visits arriving from LinkedIn, Facebook/Instagram, X and WhatsApp. Post an article
                (Share preview tab) and watch this move.
              </p>
            </div>
            <div style={S.card}>
              <div style={S.h}>Partner webshop clicks</div>
              <List rows={outbound} labels={PARTNER_LABELS} empty="No clicks out to the webshops yet in this period." />
            </div>
          </div>

          <div style={S.grid}>
            <div style={S.card}>
              <div style={S.h}>Where visitors come from</div>
              <List rows={sources} labels={SOURCE_LABELS} empty="Nothing yet." />
            </div>
            <div style={S.card}>
              <div style={S.h}>Most read pages</div>
              <List rows={paths} empty="Nothing yet." />
            </div>
            <div style={S.card}>
              <div style={S.h}>Articles</div>
              <List rows={articles} empty="No article reads yet. Publish and share one." />
            </div>
            <div style={S.card}>
              <div style={S.h}>Shares by channel</div>
              <List rows={shares} labels={SHARE_LABELS} empty="No shares from the article pages yet. This shows which channels the audience itself shares on." />
            </div>
          </div>

          <p style={{ fontSize: 12, opacity: 0.6, marginTop: 20, lineHeight: 1.6, maxWidth: 640 }}>
            These are the site&#39;s own honest counters, great for learning and for the weekly rhythm.
            When the team wants funnels, conversion goals and audiences, that is what Google Tag Manager
            + a consented analytics tool adds on top (Site settings → Tracking), without replacing this.
          </p>
        </>
      )}
    </div>
  );
}
