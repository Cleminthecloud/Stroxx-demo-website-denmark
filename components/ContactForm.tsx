'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

/** The contact form the "Contact form" landing block renders. Posts to
 *  /api/form (webhook destination); if the webhook is not configured the
 *  error state points to the phone instead of pretending it sent. */

export default function ContactForm({
  topic,
  buttonLabel,
  successMessage,
  phone,
}: {
  topic?: string;
  buttonLabel?: string;
  successMessage?: string;
  phone?: string;
}) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error' | 'offline'>('idle');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (state === 'error' || state === 'offline') setState('idle');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'busy' || state === 'done') return;
    setState('busy');
    try {
      const r = await fetch('/api/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, topic: topic || '', company: '' }),
      });
      if (r.ok) return setState('done');
      setState(r.status === 503 ? 'offline' : 'error');
      return;
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2.5 text-white">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stroxx-blue/20 border border-stroxx-blue/50">
          <Check size={15} className="text-stroxx-blue" />
        </span>
        {successMessage || 'Thanks, we will get back to you within one working day.'}
      </div>
    );
  }

  const field =
    'w-full rounded-2xl bg-white/[0.07] px-5 py-3 text-white placeholder:text-fog/60 outline-none backdrop-blur-sm transition-colors focus:bg-white/[0.11]';

  return (
    <form onSubmit={submit} className="w-full max-w-xl space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input required value={form.name} onChange={set('name')} placeholder="Name" aria-label="Name" className={field} />
        <input required type="email" value={form.email} onChange={set('email')} placeholder="Email" aria-label="Email" className={field} />
      </div>
      <input value={form.phone} onChange={set('phone')} placeholder="Phone (optional)" aria-label="Phone" className={field} />
      <textarea required value={form.message} onChange={set('message')} placeholder="What can we help with?" aria-label="Message" rows={5} className={`${field} resize-y`} />
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button type="submit" disabled={state === 'busy'}
          className="glass-cta inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white disabled:opacity-60">
          {state === 'busy' ? 'Sending…' : buttonLabel || 'Send'} <ArrowRight size={15} />
        </button>
        {state === 'error' && (
          <p className="text-red-400 text-xs">That did not go through. Try again, or call {phone || '+45 44 85 55 11'}.</p>
        )}
        {state === 'offline' && (
          <p className="text-fog text-xs">The form is not connected yet. Call us on {phone || '+45 44 85 55 11'} instead.</p>
        )}
      </div>
    </form>
  );
}
