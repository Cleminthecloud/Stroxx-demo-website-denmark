'use client';

import { useCallback, useEffect, useState } from 'react';
import { useFormValue } from 'sanity';

/** Traffic light for the newsletter connection, shown at the top of the
 *  MARKET document's newsletter box. Asks /api/newsletter/status with this
 *  market's URL code (server-side check against the market's CMS key or the
 *  hosting-environment fallback; no key material ever reaches the browser).
 *  The field stores nothing. */

type S = {
  provider: string;
  enabled: boolean;
  listConfigured: boolean;
  status: 'connected' | 'key-missing' | 'error' | 'not-selected' | 'not-pinged';
};

const LABELS: Record<string, string> = {
  mailchimp: 'Mailchimp',
  klaviyo: 'Klaviyo',
  marketo: 'Adobe Marketo',
  webhook: 'Webhook',
};

const TEXT: Record<S['status'], (p: string) => string> = {
  connected: (p) => `${p}: connected. Signups will land.`,
  'key-missing': (p) => `${p}: not connected yet. Enter the ${p} keys in the fields below and publish.`,
  error: (p) => `${p}: keys entered but ${p} did not accept them. Double-check them in the fields below.`,
  'not-selected': () => 'No platform selected yet. Pick one below.',
  'not-pinged': (p) => `${p}: webhook address is set (catch hooks cannot be test-pinged).`,
};

const DOT: Record<S['status'], string> = {
  connected: '#22c55e',
  'key-missing': '#ef4444',
  error: '#f59e0b',
  'not-selected': '#6b7280',
  'not-pinged': '#22c55e',
};

export default function NewsletterStatusField() {
  const [s, setS] = useState<S | null>(null);
  const [busy, setBusy] = useState(false);
  /* This market's URL code (the slug field on the same document), so the
     status check runs against THIS market's provider config. */
  const code = (useFormValue(['code']) as { current?: string } | undefined)?.current || '';

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await fetch(`/api/newsletter/status${code ? `?market=${encodeURIComponent(code)}` : ''}`);
      if (r.ok) setS(await r.json());
    } catch {
      /* leave previous state */
    } finally {
      setBusy(false);
    }
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  const provider = s ? LABELS[s.provider] || 'Platform' : '';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 8,
        border: '1px solid rgba(128,128,128,0.3)',
        fontSize: 13,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: s ? DOT[s.status] : '#6b7280',
          flexShrink: 0,
        }}
      />
      <span style={{ flex: 1 }}>
        {s ? TEXT[s.status](provider) : busy ? 'Checking the connection…' : 'Status unavailable.'}
        {s && s.status === 'connected' && !s.listConfigured && s.provider !== 'webhook'
          ? ' Add the audience/list ID below.'
          : ''}
      </span>
      <button
        type="button"
        onClick={load}
        disabled={busy}
        style={{
          border: '1px solid rgba(128,128,128,0.35)',
          background: 'transparent',
          color: 'inherit',
          borderRadius: 999,
          padding: '4px 12px',
          fontSize: 12,
          cursor: 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Checking…' : 'Re-check'}
      </button>
    </div>
  );
}
