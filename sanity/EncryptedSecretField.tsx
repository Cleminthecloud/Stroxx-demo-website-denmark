'use client';

import { useState, type CSSProperties, type ChangeEvent, type KeyboardEvent } from 'react';
import { set, unset, type StringInputProps } from 'sanity';

/** Studio input for a provider secret (API key, client secret, webhook URL).
 *  The value the editor types is encrypted IN THE BROWSER with the site's RSA
 *  public key and only the ciphertext is ever written to the (public-read)
 *  dataset. The plaintext never leaves this component and the private key that
 *  could decrypt it lives only on the server. Decryption half:
 *  lib/newsletter-secrets.ts. Built with plain elements + inline styles to
 *  match NewsletterStatusField (no @sanity/ui dependency). */

const PUBKEY = process.env.NEXT_PUBLIC_NEWSLETTER_PUBKEY;

async function encrypt(plain: string, spkiB64: string): Promise<string> {
  const spki = Uint8Array.from(atob(spkiB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('spki', spki, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  const buf = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, new TextEncoder().encode(plain));
  let bin = '';
  for (const b of new Uint8Array(buf)) bin += String.fromCharCode(b);
  return btoa(bin);
}

const wrap: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' };
const input: CSSProperties = {
  flex: 1,
  minWidth: 220,
  padding: '9px 12px',
  borderRadius: 6,
  border: '1px solid rgba(128,128,128,0.35)',
  background: 'transparent',
  color: 'inherit',
  fontSize: 13,
};
const btn = (tone?: 'primary' | 'critical'): CSSProperties => ({
  border: '1px solid rgba(128,128,128,0.35)',
  background: tone === 'primary' ? '#0088C2' : 'transparent',
  color: tone === 'primary' ? '#fff' : 'inherit',
  borderColor: tone === 'critical' ? 'rgba(239,68,68,0.5)' : 'rgba(128,128,128,0.35)',
  borderRadius: 999,
  padding: '6px 14px',
  fontSize: 12,
  cursor: 'pointer',
});

export default function EncryptedSecretField(props: StringInputProps) {
  const { value, onChange } = props;
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hasValue = Boolean(value);

  if (!PUBKEY) {
    return (
      <div style={{ ...wrap, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.5)', fontSize: 12.5 }}>
        Encryption key not set up yet. Add NEXT_PUBLIC_NEWSLETTER_PUBKEY and NEWSLETTER_SECRET_KEY to the
        hosting environment (one-time), then secrets can be entered here safely.
      </div>
    );
  }

  async function save() {
    const plain = draft.trim();
    if (!plain) return;
    setBusy(true);
    setErr(null);
    try {
      const ct = await encrypt(plain, PUBKEY as string);
      onChange(set(ct));
      setDraft('');
      setEditing(false);
    } catch {
      setErr('Could not encrypt — check the key format with the developer.');
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    onChange(unset());
    setDraft('');
    setEditing(false);
    setErr(null);
  }

  if (hasValue && !editing) {
    return (
      <div style={wrap}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5 }}>
          <span aria-hidden style={{ width: 9, height: 9, borderRadius: 999, background: '#22c55e' }} />
          Encrypted · stored
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" style={btn()} onClick={() => setEditing(true)}>Replace</button>
        <button type="button" style={btn('critical')} onClick={clear}>Clear</button>
      </div>
    );
  }

  return (
    <div>
      <div style={wrap}>
        <input
          type="password"
          autoComplete="off"
          style={input}
          value={draft}
          placeholder="Paste the secret — encrypted before saving"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.currentTarget.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              save();
            }
          }}
        />
        <button type="button" style={btn('primary')} disabled={busy || !draft.trim()} onClick={save}>
          {busy ? 'Encrypting…' : 'Save encrypted'}
        </button>
        {hasValue && (
          <button type="button" style={btn()} onClick={() => { setEditing(false); setDraft(''); }}>Cancel</button>
        )}
      </div>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
        {err
          ? err
          : 'Encrypted in your browser with the site’s public key. Only the ciphertext is saved — it can’t be read back here.'}
      </div>
    </div>
  );
}
