'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

/** Newsletter signup UI: the form, the designed band above the footer, and
 *  the popup with behavior rules. Copy and rules come from Site settings
 *  (passed as props from the layout); submissions go to /api/newsletter,
 *  which speaks whichever email platform the market chose. */

export type NewsletterCopy = {
  headline: string;
  text: string;
  buttonLabel: string;
  disclaimer: string;
  success?: string;
};

const DONE_KEY = 'sx-nl-done';

export function NewsletterForm({
  copy,
  center = false,
  onDone,
}: {
  copy: NewsletterCopy;
  center?: boolean;
  onDone?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'busy' || state === 'done') return;
    setState('busy');
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company: '' }),
      });
      if (r.ok) {
        setState('done');
        try {
          localStorage.setItem(DONE_KEY, '1');
        } catch {}
        onDone?.();
        return;
      }
    } catch {}
    setState('error');
  };

  if (state === 'done') {
    return (
      <div className={`state-in flex items-center gap-2.5 text-white ${center ? 'justify-center' : ''}`}>
        <span className="check-pop flex h-8 w-8 items-center justify-center rounded-full bg-stroxx-blue/20 border border-stroxx-blue/50">
          <Check size={15} className="text-stroxx-blue" />
        </span>
        {copy.success || 'Check your inbox to confirm. Welcome aboard.'}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className={`flex flex-col sm:flex-row gap-3 ${center ? 'sm:justify-center' : ''}`}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === 'error') setState('idle');
          }}
          placeholder="your@email.dk"
          aria-label="Email address"
          className="w-full sm:max-w-sm rounded-full bg-white/[0.07] px-5 py-3 text-white placeholder:text-fog/60 outline-none backdrop-blur-sm transition-colors focus:bg-white/[0.11]"
        />
        <button
          type="submit"
          disabled={state === 'busy'}
          className="glass-cta shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {state === 'busy' ? 'Sending…' : copy.buttonLabel} <ArrowRight size={15} />
        </button>
      </div>
      <p
        key={state === 'error' ? 'error' : 'hint'}
        className={`mt-3 text-xs ${state === 'error' ? 'state-in text-red-400' : 'text-fog/70'} ${center ? 'text-center' : ''}`}
      >
        {state === 'error'
          ? 'That did not go through. Check the address and try again.'
          : copy.disclaimer}
      </p>
    </form>
  );
}

/** The designed full-width signup band, rendered above the footer. */
export function NewsletterBand({ copy }: { copy: NewsletterCopy }) {
  return (
    <section aria-label="Newsletter" className="relative">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 70% at 50% 100%, rgba(0,136,194,0.13), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-20 md:py-24 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="eyebrow mb-5">Newsletter</div>
          <h2 className="h-display text-white text-[clamp(1.9rem,4vw,3.2rem)] leading-[0.95] mb-4">{copy.headline}</h2>
          <p className="text-fog text-lg leading-relaxed max-w-md">{copy.text}</p>
        </div>
        <div className="lg:pl-8">
          <NewsletterForm copy={copy} />
        </div>
      </div>
    </section>
  );
}

/** Popup with behavior rules: appears after N seconds OR at N% scroll
 *  (first rule wins), at most once per `frequencyDays`, never for people who
 *  already signed up, and never inside the Studio preview. */
export function NewsletterPopup({
  copy,
  delaySeconds,
  scrollPercent,
  frequencyDays,
}: {
  copy: NewsletterCopy;
  delaySeconds: number;
  scrollPercent: number;
  frequencyDays: number;
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false); // drives the fade-out before unmount
  const shown = useRef(false);
  const SEEN_KEY = 'sx-nl-pop';

  // gentle exit: fade the overlay ~220ms, then unmount
  const dismiss = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 220);
  }, []);

  useEffect(() => {
    try {
      if (window.self !== window.top) return; // Presentation iframe
      if (localStorage.getItem(DONE_KEY)) return;
      const last = Number(localStorage.getItem(SEEN_KEY) || 0);
      if (Date.now() - last < frequencyDays * 86400000) return;
    } catch {
      return;
    }

    const show = () => {
      if (shown.current) return;
      shown.current = true;
      setOpen(true);
      try {
        localStorage.setItem(SEEN_KEY, String(Date.now()));
      } catch {}
    };
    const timer = setTimeout(show, Math.max(0, delaySeconds) * 1000);
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max > 0 && (window.scrollY / max) * 100 >= scrollPercent) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [delaySeconds, scrollPercent, frequencyDays]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, dismiss]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[115] flex items-end justify-center p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Newsletter signup">
      <button
        aria-label="Close"
        className={`backdrop-in absolute inset-0 bg-ink/70 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${closing ? 'opacity-0' : ''}`}
        onClick={dismiss}
      />
      <div
        className={`sheet-in relative w-full max-w-none sm:max-w-lg rounded-t-2xl rounded-b-none sm:rounded-2xl border border-white/10 bg-[#0E1013] p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:p-8 md:p-10 shadow-[0_40px_120px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-200 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${
          closing ? 'opacity-0 translate-y-3' : ''
        }`}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: 'radial-gradient(80% 60% at 50% 0%, rgba(0,136,194,0.14), transparent 70%)' }} />
        <div aria-hidden className="sheet-handle" />
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-line text-fog hover:text-white hover:border-stroxx-blue/60 transition-colors"
        >
          <X size={16} />
        </button>
        <div className="relative">
          <div className="eyebrow mb-4">Newsletter</div>
          <h3 className="h-display text-white text-3xl leading-tight mb-3">{copy.headline}</h3>
          <p className="text-fog leading-relaxed mb-7">{copy.text}</p>
          <NewsletterForm copy={copy} onDone={() => setTimeout(dismiss, 2500)} />
        </div>
      </div>
    </div>
  );
}
