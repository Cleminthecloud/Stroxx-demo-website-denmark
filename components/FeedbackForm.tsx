'use client';
import { useRef, useState } from 'react';
import { ArrowRight, ImagePlus, X } from 'lucide-react';

/** The /test page's report form. Posts to /api/feedback, which files the
 *  report as a `feedback` document for triage in the Studio. Device/browser
 *  is captured automatically on submit; the tester only describes what they
 *  saw. Inputs stay text-base: below 16px iOS zooms the page on focus. */

type State = 'idle' | 'busy' | 'done' | 'error' | 'offline';
type Kind = 'bug' | 'idea' | 'other';

const KINDS: { v: Kind; label: string }[] = [
  { v: 'bug', label: 'Something broke' },
  { v: 'idea', label: 'An idea' },
  { v: 'other', label: 'Other' },
];

const IMG_MAX = 3 * 1024 * 1024; // keep in sync with /api/feedback

export default function FeedbackForm() {
  const [state, setState] = useState<State>('idle');
  const [kind, setKind] = useState<Kind>('bug');
  const [form, setForm] = useState({ message: '', page: '', name: '', email: '' });
  const [image, setImage] = useState(''); // data URL, '' = none
  const [imgError, setImgError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    setImgError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setImgError('PNG, JPG or WebP only.');
      return;
    }
    if (file.size > IMG_MAX) {
      setImgError('Keep the screenshot under 3 MB (a phone screenshot is fine).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImage('');
    setImgError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'busy') return;
    setState('busy');
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          kind,
          image,
          device: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          company: '', // honeypot
        }),
      });
      if (r.ok) return setState('done');
      setState(r.status === 503 ? 'offline' : 'error');
    } catch {
      setState('error');
    }
  }

  const field =
    'w-full rounded-2xl bg-white/[0.07] px-5 py-3 text-base text-white placeholder:text-fog/60 outline-none backdrop-blur-sm transition-colors focus:bg-white/[0.11]';

  if (state === 'done') {
    return (
      <div className="glass-panel rounded-2xl p-8">
        <div className="text-white text-xl font-medium mb-2">Got it. Thank you.</div>
        <p className="text-fog leading-relaxed">
          Your report is in the review queue. Found something else? Reload the page and send another,
          every single one helps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.v}
            type="button"
            onClick={() => setKind(k.v)}
            aria-pressed={kind === k.v}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              kind === k.v
                ? 'border-stroxx-blue/70 bg-stroxx-blue/15 text-white'
                : 'border-line bg-ink/50 text-fog hover:border-stroxx-blue/50 hover:text-white'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>
      <textarea
        required
        value={form.message}
        onChange={set('message')}
        placeholder="What happened, and what did you expect instead? The more concrete, the better."
        aria-label="Your report"
        rows={5}
        className={`${field} resize-y`}
      />
      <input
        value={form.page}
        onChange={set('page')}
        placeholder="Where on the site? (e.g. the product page, the map)"
        aria-label="Where on the site"
        className={field}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <input value={form.name} onChange={set('name')} placeholder="Your name (optional)" aria-label="Name" className={field} />
        <input
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="Email, if we may follow up (optional)"
          aria-label="Email"
          className={field}
        />
      </div>

      {/* optional screenshot */}
      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={pickImage} className="hidden" id="fb-shot" />
        {!image ? (
          <label
            htmlFor="fb-shot"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-ink/50 px-4 py-2 text-sm text-fog transition-colors hover:border-stroxx-blue/50 hover:text-white"
          >
            <ImagePlus size={15} /> Attach a screenshot (optional)
          </label>
        ) : (
          <span className="inline-flex items-center gap-3 rounded-2xl border border-line bg-ink/50 p-2 pr-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Screenshot to attach" className="h-12 w-12 rounded-lg object-cover" />
            <span className="text-sm text-fog">Screenshot attached</span>
            <button type="button" onClick={clearImage} aria-label="Remove screenshot" className="text-fog transition-colors hover:text-white">
              <X size={15} />
            </button>
          </span>
        )}
        {imgError && <span className="text-sm text-fog">{imgError}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={state === 'busy' || !form.message.trim()}
          className="glass-cta inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {state === 'busy' ? 'Sending…' : 'Send report'} <ArrowRight size={15} />
        </button>
        {state === 'error' && <span className="text-sm text-fog">That did not go through. Try again in a minute.</span>}
        {state === 'offline' && (
          <span className="text-sm text-fog">
            The form is offline right now, mail your note to{' '}
            <a href="mailto:cleminthecloud@gmail.com?subject=STROXX%20feedback" className="text-stroxx-blue underline underline-offset-2">
              cleminthecloud@gmail.com
            </a>{' '}
            instead.
          </span>
        )}
      </div>
      <p className="text-xs text-fog/70 leading-relaxed">
        Your device and browser type are attached automatically so we can reproduce what you saw. Nothing else is collected.
      </p>
    </form>
  );
}
