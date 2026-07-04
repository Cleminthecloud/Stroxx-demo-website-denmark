'use client';
import { useState } from 'react';
import GlassButton from '@/components/GlassButton';

/** Pro Club signup on product pages. Real submissions: posts to
 *  /api/newsletter, which forwards to whichever email platform the market
 *  chose in Site settings → Newsletter (Mailchimp/Klaviyo/Marketo/webhook).
 *  Requires the newsletter to be enabled there; otherwise the form reports
 *  it is not open yet instead of pretending. */
export default function ProClubSignup({ headline, text }: { headline?: string; text?: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [email, setEmail] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'busy' || state === 'done') return;
    setState('busy');
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), company: '' }),
      });
      if (r.ok) {
        setState('done');
        try {
          localStorage.setItem('sx-nl-done', '1');
        } catch {}
        return;
      }
    } catch {}
    setState('error');
  };

  return (
    <div className="glass-panel glass-panel--frost rounded-xl p-7">
      <div className="eyebrow mb-3">Pro Club</div>
      <h3 className="text-white font-display font-bold text-2xl mb-2">{headline || 'Know it before everyone else'}</h3>
      <p className="text-fog text-sm mb-5">
        {text || 'Early access and specialist tips, straight to your inbox. A couple of emails a month, tops. No spam.'}
      </p>
      {state === 'done' ? (
        <div className="text-white bg-steel border border-line rounded-sm px-4 py-3 text-sm">
          You&apos;re in. Check your inbox to confirm. 👊
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === 'error') setState('idle');
            }}
            placeholder="you@email.com"
            className="flex-1 bg-ink border border-line rounded-sm px-4 py-2.5 text-base sm:text-sm text-white placeholder:text-fog/60 focus:border-fog outline-none"
          />
          <GlassButton submit>{state === 'busy' ? 'Sending…' : 'Sign up'}</GlassButton>
        </form>
      )}
      {state === 'error' && (
        <p className="text-red-400 text-[11px] mt-3">
          Signups are not open yet, or something slipped. Try again later.
        </p>
      )}
    </div>
  );
}
