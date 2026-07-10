'use client';

import { useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';

/** "Dashboard" Studio tab: the site's own first-party numbers, collected by
 *  /api/track and the /qr short links (anonymous day counters, no cookies).
 *  Styled like the site itself (ink, glass, STROXX blue) with hand-rolled
 *  SVG charts, no chart library, nothing added to the site bundle. The goal
 *  stays didactic: teach the team to read source → content → product →
 *  partner-shop click, and to make decisions from it. */

type Day = {
  _id: string;
  day: string;
  total?: number;
  paths?: Record<string, number>;
  pathNames?: Record<string, string>;
  sources?: Record<string, number>;
  outbound?: Record<string, number>;
  shares?: Record<string, number>;
  qr?: Record<string, number>;
  signups?: number;
};

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct (typed / bookmark / QR)',
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

/* the brand: blue is the only accent, everything else is light on ink */
const BLUE = '#0088C2';
const BLUE_HOVER = '#2FACE8';
const GLOW = '#38BAFF';
const INK = '#0B0C0E';
const FOG = '#8A9199';
const DONUT_COLORS = [GLOW, BLUE, '#2276fc', '#7DD3FC', '#5E6AD2', FOG, '#5B6470', '#3D4450', '#2B3038', '#23272E'];

function mergeCounts(days: Day[], field: 'paths' | 'sources' | 'outbound' | 'shares' | 'qr'): [string, number][] {
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

/* ── tiny SVG chart kit (no library, no site-bundle impact) ─────────────── */

function Donut({ rows, labels, size = 168 }: { rows: [string, number][]; labels: Record<string, string>; size?: number }) {
  const total = rows.reduce((a, [, v]) => a + v, 0);
  const top = rows.slice(0, 6);
  const rest = rows.slice(6).reduce((a, [, v]) => a + v, 0);
  const segs = rest > 0 ? [...top, ['other_sites', rest] as [string, number]] : top;
  const r = 62;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
        {total > 0 &&
          segs.map(([k, v], i) => {
            const frac = v / total;
            const el = (
              <circle
                key={k}
                cx="80" cy="80" r={r} fill="none"
                stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                strokeWidth="18"
                strokeDasharray={`${Math.max(frac * C - 2, 0.5)} ${C}`}
                strokeDashoffset={-offset * C}
                strokeLinecap="butt"
                transform="rotate(-90 80 80)"
              >
                <title>{`${labels[k] ?? k}: ${v} (${Math.round(frac * 100)}%)`}</title>
              </circle>
            );
            offset += frac;
            return el;
          })}
        <text x="80" y="76" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="700">{total}</text>
        <text x="80" y="96" textAnchor="middle" fill={FOG} fontSize="10.5" letterSpacing="0.08em">VISITS</text>
      </svg>
      <div style={{ minWidth: 180, flex: 1 }}>
        {segs.length === 0 && <div style={{ color: FOG, fontSize: 13 }}>Waiting for the first visit.</div>}
        {segs.map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, marginBottom: 6, color: '#E7EAEE' }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labels[k] ?? k}</span>
            <span style={{ color: FOG }}>{total ? Math.round((v / total) * 100) : 0}%</span>
            <span style={{ color: '#fff', fontWeight: 600, minWidth: 28, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyBars({ series }: { series: { day: string; n: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.n));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: series.length > 40 ? 1 : 3, height: 92, marginTop: 18 }}>
      {series.map((s) => (
        <div
          key={s.day}
          title={`${s.day}: ${s.n} pageviews`}
          style={{
            flex: 1,
            height: `${Math.max((s.n / max) * 100, 2)}%`,
            background: s.n === 0 ? 'rgba(255,255,255,0.07)' : `linear-gradient(180deg, ${GLOW}, ${BLUE})`,
            borderRadius: 3,
            boxShadow: s.n === max && s.n > 0 ? `0 0 14px rgba(56,186,255,0.55)` : 'none',
            minWidth: 2,
          }}
        />
      ))}
    </div>
  );
}

function HBars({ rows, labels, days, empty }: { rows: [string, number][]; labels?: Record<string, string>; days: Day[]; empty: string }) {
  const max = Math.max(1, ...rows.map(([, v]) => v));
  if (!rows.length) return <p style={{ fontSize: 12.5, color: FOG, lineHeight: 1.55 }}>{empty}</p>;
  return (
    <div>
      {rows.slice(0, 8).map(([k, v]) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, marginBottom: 4 }}>
            <span style={{ color: '#E7EAEE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {labels ? labels[k] ?? k : pathName(days, k)}
            </span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{v}</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(v / max) * 100}%`, borderRadius: 3, background: `linear-gradient(90deg, ${BLUE}, ${GLOW})` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

export default function DashboardTool() {
  const client = useClient({ apiVersion: '2026-07-01' });
  const [all, setAll] = useState<Day[]>([]);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(7);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrLabels, setQrLabels] = useState<Record<string, string>>({});
  const [footprint, setFootprint] = useState<{ stores: number; specialists: number; dk: number; de: number; fr: number; be: number }>({ stores: 0, specialists: 0, dk: 0, de: 0, fr: 0, be: 0 });

  useEffect(() => {
    client
      .fetch<Day[]>(`*[_type == "dayStats"] | order(day desc)[0...120]`)
      .then((r) => setAll(r || []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
    /* labels for the QR card: dayStats keys are the code with - → _ */
    client
      .fetch<{ code?: string; label?: string }[]>(`*[_type == "qrCode"]{ "code": code.current, label }`)
      .then((rows) => {
        const m: Record<string, string> = {};
        for (const r of rows || []) if (r.code) m[r.code.replace(/-/g, '_')] = `/qr/${r.code} · ${r.label || ''}`;
        setQrLabels(m);
      })
      .catch(() => setQrLabels({}));
    /* brand footprint: live totals, not period-based */
    client
      .fetch<{ stores: number; specialists: number; dk: number; de: number; fr: number; be: number }>(
        `{ "stores": count(*[_type == "store" && active != false]), "specialists": count(*[_type == "store" && active != false && defined(specialist.name)]), "dk": count(*[_type == "store" && active != false && country == "dk"]), "de": count(*[_type == "store" && active != false && country == "de"]), "fr": count(*[_type == "store" && active != false && country == "fr"]), "be": count(*[_type == "store" && active != false && country == "be"]) }`,
      )
      .then((r) => setFootprint(r || { stores: 0, specialists: 0, dk: 0, de: 0, fr: 0, be: 0 }))
      .catch(() => {});
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
  const qr = useMemo(() => mergeCounts(days, 'qr'), [days]);
  const articles = useMemo(() => paths.filter(([k]) => k.startsWith('nyheder')), [paths]);
  const social = sources.filter(([k]) => ['linkedin', 'meta', 'x', 'whatsapp'].includes(k)).reduce((a, [, v]) => a + v, 0);
  const outTotal = outbound.reduce((a, [, v]) => a + v, 0);
  const qrTotal = qr.reduce((a, [, v]) => a + v, 0);
  const signups = days.reduce((a, d) => a + (d.signups ?? 0), 0);

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

  const report = () => {
    const L: string[] = [];
    L.push(`# STROXX site report, last ${period} days (${new Date().toISOString().slice(0, 10)})`);
    L.push('');
    L.push(`Total pageviews: ${total}`);
    L.push(`From social shares (LinkedIn, Meta, X, WhatsApp): ${social}`);
    L.push(`Newsletter signups: ${signups}`);
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
    if (qr.length) {
      L.push('');
      L.push('## QR scans (packaging & print short links)');
      for (const [k, v] of qr) L.push(`- ${qrLabels[k] ?? k.replace(/_/g, '-')}: ${v}`);
    }
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

  /** "Download PDF": a print-designed report in a new window; the browser's
   *  print dialog saves it as PDF. No library, and the layout is ours:
   *  white paper, STROXX blue, real bars. */
  const downloadPdf = () => {
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const bars = (rows: [string, number][], labels?: Record<string, string>, limit = 10) => {
      const max = Math.max(1, ...rows.map(([, v]) => v));
      if (!rows.length) return '<p class="empty">Nothing in this period.</p>';
      return rows
        .slice(0, limit)
        .map(
          ([k, v]) => `
          <div class="row">
            <span class="lbl">${esc(labels ? labels[k] ?? k : pathName(days, k))}</span>
            <span class="track"><span class="fill" style="width:${(v / max) * 100}%"></span></span>
            <span class="val">${v}</span>
          </div>`
        )
        .join('');
    };
    const daily = series
      .map(
        (s) =>
          `<div class="day" title="${s.day}"><div class="bar" style="height:${Math.max((s.n / Math.max(1, ...series.map((x) => x.n))) * 100, 2)}%"></div></div>`
      )
      .join('');
    const kpi = (label: string, value: number, note: string) =>
      `<div class="kpi"><div class="k-label">${label}</div><div class="k-value">${value}</div><div class="k-note">${note}</div></div>`;
    const section = (title: string, body: string) => `<div class="section"><h2>${title}</h2>${body}</div>`;
    const today = new Date().toISOString().slice(0, 10);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>STROXX site report · last ${period} days · ${today}</title>
<style>
  @page { margin: 16mm 14mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #14171B; margin: 0; }
  .head { border-bottom: 3px solid #0088C2; padding-bottom: 14px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: flex-end; }
  .brand { font-size: 26px; font-weight: 800; letter-spacing: 0.06em; }
  .brand span { color: #0088C2; }
  .meta { font-size: 11px; color: #6B7280; text-align: right; line-height: 1.5; }
  .kpis { display: flex; gap: 10px; margin-bottom: 20px; }
  .kpi { flex: 1; border: 1px solid #E3E6EA; border-radius: 10px; padding: 12px 14px; }
  .k-label { font-size: 9.5px; letter-spacing: 0.1em; text-transform: uppercase; color: #6B7280; font-weight: 700; }
  .k-value { font-size: 27px; font-weight: 800; margin: 4px 0 2px; }
  .k-note { font-size: 9.5px; color: #6B7280; line-height: 1.4; }
  .section { margin-bottom: 18px; break-inside: avoid; }
  h2 { font-size: 12px; letter-spacing: 0.09em; text-transform: uppercase; color: #0088C2; margin: 0 0 8px; }
  .row { display: flex; align-items: center; gap: 8px; font-size: 11px; margin-bottom: 5px; }
  .lbl { width: 210px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .track { flex: 1; height: 7px; background: #EEF1F4; border-radius: 4px; overflow: hidden; }
  .fill { display: block; height: 100%; background: linear-gradient(90deg, #0088C2, #38BAFF); border-radius: 4px; }
  .val { width: 36px; text-align: right; font-weight: 700; font-size: 11px; }
  .chart { display: flex; align-items: flex-end; gap: 2px; height: 70px; border-bottom: 1px solid #E3E6EA; }
  .day { flex: 1; display: flex; align-items: flex-end; height: 100%; }
  .bar { width: 100%; background: linear-gradient(180deg, #38BAFF, #0088C2); border-radius: 2px 2px 0 0; }
  .empty { font-size: 11px; color: #6B7280; }
  .journey { margin-top: 20px; padding: 12px 14px; background: #F2F8FB; border-left: 3px solid #0088C2; font-size: 11px; line-height: 1.6; }
  .foot { margin-top: 24px; font-size: 9.5px; color: #9AA1A9; }
</style></head><body>
  <div class="head">
    <div class="brand">STROXX<span>.</span> <span style="font-size:13px; letter-spacing:0.02em; color:#6B7280; font-weight:600;">site report</span></div>
    <div class="meta">Last ${period} days · generated ${today}<br>First-party, anonymous counting (no cookies)</div>
  </div>
  <div class="kpis">
    ${kpi('Pageviews', total, 'All pages, this period')}
    ${kpi('From social', social, 'LinkedIn, Meta, X, WhatsApp')}
    ${kpi('QR scans', qrTotal, 'Print short links (/qr)')}
    ${kpi('Partner clicks', outTotal, 'Hand-offs to dealer webshops')}
    ${kpi('Signups', signups, 'Newsletter subscriptions')}
  </div>
  ${section('Traffic, day by day', `<div class="chart">${daily}</div>`)}
  ${section('Where visitors came from', bars(sources, SOURCE_LABELS))}
  ${section('Most read pages', bars(paths, undefined, 12))}
  ${articles.length ? section('Articles', bars(articles)) : ''}
  ${section('Shares from the article pages', bars(shares, SHARE_LABELS))}
  ${qr.length ? section('QR scans by code', bars(qr, qrLabels)) : ''}
  ${section('Clicks out to partner webshops', bars(outbound, PARTNER_LABELS))}
  <div class="journey"><strong>How to read it:</strong> the journey that pays is source → article or campaign → product page → partner webshop click. Content that creates partner clicks earns its place; sources that grow deserve more of it.</div>
  <div class="foot">STROXX brand platform · first-party dashboard export. Numbers are the site's own honest counters; GTM/analytics tools may differ slightly by design.</div>
  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 150); });</script>
</body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  /* ── the STROXX look: ink canvas, glass cards, blue glow ── */
  const S = {
    canvas: {
      minHeight: '100%',
      background: `radial-gradient(90% 60% at 50% -10%, rgba(0,136,194,0.16), ${INK} 60%)`,
      color: '#fff',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    } as const,
    wrap: { maxWidth: 1060, margin: '0 auto', padding: '40px 28px 90px' } as const,
    eyebrow: { fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: BLUE_HOVER, fontWeight: 700, marginBottom: 10 },
    h1: { fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 } as const,
    lede: { fontSize: 13.5, color: FOG, marginBottom: 22, lineHeight: 1.6, maxWidth: 640 } as const,
    row: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' } as const,
    pill: (on: boolean) =>
      ({
        padding: '7px 15px', borderRadius: 999,
        border: on ? `1px solid ${BLUE}` : '1px solid rgba(255,255,255,0.14)',
        background: on ? BLUE : 'transparent',
        color: on ? '#fff' : FOG,
        cursor: 'pointer', fontSize: 13, fontWeight: on ? 600 : 400,
        boxShadow: on ? '0 0 18px rgba(0,136,194,0.45)' : 'none',
        transition: 'all .2s',
      }) as const,
    ghost: { padding: '8px 18px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 13, cursor: 'pointer' } as const,
    grid: (min: number) => ({ display: 'grid', gap: 14, gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, marginTop: 14 }) as const,
    card: {
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 20,
      background: 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    } as const,
    h: { fontSize: 11.5, fontWeight: 700, color: FOG, marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
    big: { fontSize: 38, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' } as const,
    hint: { fontSize: 12, color: FOG, marginTop: 12, lineHeight: 1.55, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 } as const,
    kpiLabel: { fontSize: 12, color: FOG, marginTop: 8 } as const,
  };

  const Kpi = ({ label, value, hint }: { label: string; value: number; hint: string }) => (
    <div style={S.card}>
      <div style={S.h}>{label}</div>
      <div style={S.big}>{value}</div>
      <div style={S.kpiLabel}>{hint}</div>
    </div>
  );

  return (
    <div style={S.canvas}>
      <div style={S.wrap}>
        <div style={S.eyebrow}>STROXX · own numbers</div>
        <h1 style={S.h1}>Dashboard</h1>
        <p style={S.lede}>
          Counted by the site itself, anonymously (no cookies, no consent needed). The journey that pays:
          {' '}<strong style={{ color: '#fff' }}>source → article or campaign → product page → partner webshop</strong>.
          Every card below is one link of that chain.
        </p>

        <div style={S.row}>
          {PERIODS.map((p) => (
            <button key={p} style={S.pill(period === p)} onClick={() => setPeriod(p)}>Last {p} days</button>
          ))}
          <button style={S.ghost} onClick={copyReport}>{copied ? 'Report copied ✓' : 'Copy report'}</button>
          <button style={S.ghost} onClick={downloadPdf}>Download PDF</button>
        </div>

        {loading ? (
          <p style={{ fontSize: 13, color: FOG, marginTop: 22 }}>Loading…</p>
        ) : (
          <>
            {all.length === 0 && (
              <div style={{ ...S.card, marginTop: 16, border: `1px solid rgba(0,136,194,0.5)` }}>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#E7EAEE' }}>
                  <strong>No visits counted yet</strong>, so everything below shows zero. This is the full
                  dashboard layout; the cards fill from the first visit. Counting needs the
                  SANITY_API_WRITE_TOKEN in the hosting environment (already set on the live site).
                </p>
              </div>
            )}

            {/* KPI row */}
            <div style={S.grid(200)}>
              <Kpi label="Pageviews" value={total} hint={`Last ${period} days, all pages.`} />
              <Kpi label="From social" value={social} hint="Visits via LinkedIn, Meta, X, WhatsApp." />
              <Kpi label="QR scans" value={qrTotal} hint="Scans of the /qr print short links." />
              <Kpi label="Partner clicks" value={outTotal} hint="Hand-offs to the dealer webshops. The goal line." />
              <Kpi label="Signups" value={signups} hint="Newsletter subscriptions from the site." />
            </div>

            {/* brand footprint · live totals (not period-based) */}
            <div style={{ fontSize: 13, color: FOG, fontWeight: 600, marginTop: 28, marginBottom: 10 }}>
              Brand footprint · live totals
            </div>
            <div style={S.grid(200)}>
              <Kpi label="STROXX stores" value={footprint.stores} hint="Physical stores carrying STROXX across the markets." />
              <Kpi label="STROXX specialists" value={footprint.specialists} hint="Stores with a dedicated STROXX specialist on the ground." />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {([['Denmark', footprint.dk], ['Germany', footprint.de], ['France', footprint.fr], ['Belgium', footprint.be]] as [string, number][]).map(([name, val]) => (
                <div key={name} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, padding: '6px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{val}</span>
                  <span style={{ color: FOG, fontSize: 12 }}>{name}</span>
                </div>
              ))}
            </div>

            {/* traffic + sources */}
            <div style={S.grid(340)}>
              <div style={S.card}>
                <div style={S.h}>Traffic, day by day</div>
                <div style={S.big}>{total}</div>
                <DailyBars series={series} />
                <div style={S.hint}>
                  Read it like a heartbeat: spikes should match your posts and campaigns. A spike with no
                  post behind it = something got shared; find it under Most read.
                </div>
              </div>
              <div style={S.card}>
                <div style={S.h}>Where visitors come from</div>
                <Donut rows={sources} labels={SOURCE_LABELS} />
                <div style={S.hint}>
                  Decide with it: big Direct slice = QR codes and typed visits, feed it with packaging.
                  Growing Search slice = articles are ranking, write more of what ranks.
                </div>
              </div>
            </div>

            {/* content + hand-off */}
            <div style={S.grid(250)}>
              <div style={S.card}>
                <div style={S.h}>Most read pages</div>
                <HBars rows={paths} days={days} empty="Waiting for the first pageview." />
              </div>
              <div style={S.card}>
                <div style={S.h}>Articles</div>
                <HBars rows={articles} days={days} empty="No article reads yet. Publish one (Article AI helps) and share it." />
                <div style={S.hint}>Double down on the article topics people actually read.</div>
              </div>
              <div style={S.card}>
                <div style={S.h}>Partner webshop clicks</div>
                <HBars rows={outbound} labels={PARTNER_LABELS} days={days} empty="No hand-offs yet in this period." />
                <div style={S.hint}>This is the money metric: content that creates these clicks earns its place.</div>
              </div>
            </div>

            {/* sharing + QR */}
            <div style={S.grid(250)}>
              <div style={S.card}>
                <div style={S.h}>Shares by channel</div>
                <HBars rows={shares} labels={SHARE_LABELS} days={days} empty="No shares from the article pages yet. This shows which channels the audience itself prefers." />
              </div>
              <div style={S.card}>
                <div style={S.h}>QR scans (print short links)</div>
                <HBars rows={qr} labels={qrLabels} days={days} empty="No scans yet. Only /qr/... links count here; old packaging codes show up as Direct + the support pages." />
                <div style={S.hint}>Per-campaign packaging performance, visible for the first time.</div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: FOG, marginTop: 20, lineHeight: 1.6, maxWidth: 680 }}>
              These are the site&#39;s own honest counters, ideal for the weekly rhythm: share Monday, Copy report Friday.
              When the team wants funnels, conversion goals and audiences, Google Tag Manager + a consented analytics
              tool (Site settings → Tracking) adds that on top, never instead.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
