'use client';

import { useRef, useState, type CSSProperties } from 'react';

/** "Help" Studio tab: a chat box that answers editor how-to questions, grounded
 *  in lib/help-knowledge.ts via /api/help (same-origin). No key material, no
 *  content is created, it just explains how to use the Studio. */

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'How do I change the tool of the month?',
  'How do I add a film?',
  'How do I swap the header logo?',
  'How do QR codes work?',
];

const S: Record<string, CSSProperties> = {
  wrap: { maxWidth: 760, margin: '0 auto', padding: '28px 24px 40px' },
  log: { display: 'flex', flexDirection: 'column', gap: 12, margin: '18px 0' },
  bubbleUser: { alignSelf: 'flex-end', maxWidth: '85%', background: '#0088C2', color: '#fff', padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' },
  bubbleBot: { alignSelf: 'flex-start', maxWidth: '92%', background: 'rgba(128,128,128,0.14)', color: 'inherit', padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' },
  chip: { border: '1px solid rgba(128,128,128,0.35)', background: 'transparent', color: 'inherit', borderRadius: 999, padding: '6px 12px', fontSize: 12.5, cursor: 'pointer' },
  row: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  ta: { flex: 1, minHeight: 44, maxHeight: 160, resize: 'vertical', padding: '11px 13px', borderRadius: 10, border: '1px solid rgba(128,128,128,0.35)', background: 'transparent', color: 'inherit', fontSize: 14, fontFamily: 'inherit' },
  send: { border: '1px solid rgba(128,128,128,0.35)', background: '#0088C2', color: '#fff', borderRadius: 10, padding: '11px 18px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' },
};

export default function HelpTool() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const logEnd = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setErr('');
    const next: Msg[] = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const r = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.reply) {
        setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
      } else {
        setErr(r.status === 429 ? 'Slow down a moment, then try again.' : 'That did not go through. Try again in a minute.');
      }
    } catch {
      setErr('That did not go through. Try again in a minute.');
    } finally {
      setBusy(false);
      setTimeout(() => logEnd.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    }
  }

  return (
    <div style={S.wrap}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Help</h1>
      <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 18, lineHeight: 1.5 }}>
        Ask how to do anything in the Studio, changing the month, adding a film, QR codes, publishing. Answers come from the STROXX guide; nothing here is created or published.
      </p>

      {messages.length === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" style={S.chip} onClick={() => ask(s)} disabled={busy}>{s}</button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div style={S.log}>
          {messages.map((m, i) => (
            <div key={i} style={m.role === 'user' ? S.bubbleUser : S.bubbleBot}>{m.content}</div>
          ))}
          {busy && <div style={{ ...S.bubbleBot, opacity: 0.6 }}>Thinking…</div>}
          <div ref={logEnd} />
        </div>
      )}

      {err && <p style={{ fontSize: 13, color: '#e8590c', margin: '6px 0' }}>{err}</p>}

      <div style={S.row}>
        <textarea
          style={S.ta}
          value={input}
          placeholder="Ask a question…"
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              ask(input);
            }
          }}
        />
        <button type="button" style={S.send} onClick={() => ask(input)} disabled={busy || !input.trim()}>
          {busy ? 'Asking…' : 'Ask'}
        </button>
      </div>
    </div>
  );
}
