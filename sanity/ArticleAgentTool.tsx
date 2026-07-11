'use client';

import { useState } from 'react';

/** "Article AI" Studio tab: topic recommendations (live web search), article
 *  drafting, polishing, and LinkedIn posts. Talks to /api/blog-agent on the
 *  same domain. The output is plain text the editor copies into a News
 *  article document (Content → News article → +). */

type Mode = 'ideas' | 'draft' | 'polish' | 'social';

const MODES: { id: Mode; label: string; hint: string; placeholder: string; needsInput: boolean }[] = [
  {
    id: 'ideas',
    label: 'Article ideas',
    hint: 'Six recommendations for what to write this week, based on live search of what the trades world is talking about in your market. Question-shaped headlines get you quoted by AI assistants.',
    placeholder: 'Optional: steer it, e.g. "focus on lasers" or "something seasonal for autumn"',
    needsInput: false,
  },
  {
    id: 'draft',
    label: 'Draft an article',
    hint: 'Paste an idea (or one of the recommendations) and get a full draft: article, excerpt, SEO title + description, share-image idea and a ready LinkedIn post.',
    placeholder: 'The idea or brief, e.g. "Which laser class is allowed on a public construction site? Angle: ..."',
    needsInput: true,
  },
  {
    id: 'polish',
    label: 'Polish my draft',
    hint: 'Paste your own text. It keeps your voice, tightens the opening and tells you what it changed so you learn for next time.',
    placeholder: 'Paste your draft article here',
    needsInput: true,
  },
  {
    id: 'social',
    label: 'LinkedIn post',
    hint: 'Paste a finished article (or its title + excerpt + URL) and get two post variants with hooks and hashtags. Remember: the share image and OG title decide how the link card looks.',
    placeholder: 'Article title, a few lines of it, and the URL (e.g. https://.../news/my-article)',
    needsInput: true,
  },
];

const MARKETS = [
  { id: 'dk', label: 'Denmark' },
  { id: 'de', label: 'Germany' },
  { id: 'fr', label: 'France' },
  { id: 'be', label: 'Belgium' },
  { id: 'all', label: 'All markets' },
];

export default function ArticleAgentTool() {
  const [mode, setMode] = useState<Mode>('ideas');
  const [market, setMarket] = useState('dk');
  const [input, setInput] = useState('');
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  const m = MODES.find((x) => x.id === mode)!;

  const run = async () => {
    if (busy) return;
    if (m.needsInput && !input.trim()) {
      setErr('This mode needs some input first.');
      return;
    }
    setBusy(true);
    setErr('');
    setOut('');
    try {
      const r = await fetch('/api/blog-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, market, input }),
      });
      const j = await r.json().catch(() => null);
      if (r.ok && j?.text) setOut(j.text);
      else if (r.status === 429) setErr('Slow down a little: a few requests per minute is the limit.');
      else if (r.status === 503) setErr('The AI key is not configured in the hosting environment yet.');
      else setErr('That did not work. Try again in a moment.');
    } catch {
      setErr('That did not work. Try again in a moment.');
    }
    setBusy(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const S = {
    wrap: { maxWidth: 860, margin: '0 auto', padding: '32px 24px 80px', fontFamily: 'inherit' } as const,
    tabs: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 } as const,
    tab: (on: boolean) =>
      ({
        padding: '8px 14px',
        borderRadius: 999,
        border: on ? '1px solid #2276fc' : '1px solid rgba(128,128,128,0.35)',
        background: on ? 'rgba(34,118,252,0.12)' : 'transparent',
        color: 'inherit',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: on ? 600 : 400,
      }) as const,
    hint: { fontSize: 13, opacity: 0.75, lineHeight: 1.5, margin: '10px 0 18px' } as const,
    row: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' } as const,
    select: { padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(128,128,128,0.35)', background: 'transparent', color: 'inherit', fontSize: 13 } as const,
    ta: {
      width: '100%',
      minHeight: mode === 'polish' || mode === 'social' ? 180 : 80,
      padding: 12,
      borderRadius: 10,
      border: '1px solid rgba(128,128,128,0.35)',
      background: 'transparent',
      color: 'inherit',
      fontSize: 14,
      lineHeight: 1.5,
      resize: 'vertical' as const,
    },
    btn: {
      padding: '10px 20px',
      borderRadius: 999,
      border: 'none',
      background: '#2276fc',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: busy ? 'wait' : 'pointer',
      opacity: busy ? 0.6 : 1,
    } as const,
    out: {
      whiteSpace: 'pre-wrap' as const,
      fontSize: 14,
      lineHeight: 1.6,
      padding: 18,
      borderRadius: 12,
      border: '1px solid rgba(128,128,128,0.3)',
      marginTop: 18,
    },
    copyBtn: {
      padding: '6px 14px',
      borderRadius: 999,
      border: '1px solid rgba(128,128,128,0.4)',
      background: 'transparent',
      color: 'inherit',
      fontSize: 12,
      cursor: 'pointer',
    } as const,
  };

  return (
    <div style={S.wrap}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Article AI</h1>
      <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 20, lineHeight: 1.5 }}>
        Ideas, drafts and LinkedIn posts for the news section. Workflow: get ideas → draft → paste into a
        new News article (Content → News article) → publish → grab the LinkedIn post. Every article you
        share drives traffic back to the site, and question-shaped articles get quoted by AI assistants.
      </p>

      <div style={S.tabs}>
        {MODES.map((x) => (
          <button key={x.id} style={S.tab(mode === x.id)} onClick={() => { setMode(x.id); setErr(''); }}>
            {x.label}
          </button>
        ))}
      </div>
      <p style={S.hint}>{m.hint}</p>

      <div style={S.row}>
        <label style={{ fontSize: 13, opacity: 0.75 }}>Market:</label>
        <select style={S.select} value={market} onChange={(e) => setMarket(e.target.value)}>
          {MARKETS.map((x) => (
            <option key={x.id} value={x.id}>{x.label}</option>
          ))}
        </select>
        <button style={S.btn} onClick={run} disabled={busy}>
          {busy ? 'Thinking (can take up to a minute)…' : m.label}
        </button>
      </div>

      <textarea style={S.ta} value={input} onChange={(e) => setInput(e.target.value)} placeholder={m.placeholder} />

      {err && <p style={{ color: '#e5484d', fontSize: 13, marginTop: 10 }}>{err}</p>}

      {out && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button style={S.copyBtn} onClick={copy}>{copied ? 'Copied ✓' : 'Copy all'}</button>
          </div>
          <div style={S.out}>{out}</div>
        </>
      )}
    </div>
  );
}
