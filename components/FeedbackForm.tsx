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

const MAX_IMAGES = 4;
const MAX_EDGE = 1600; // longest side after downscale (px)

/** Downscale + re-encode a picked image in the browser so several fit under
 *  Vercel's ~4.5MB request cap. Longest edge capped at MAX_EDGE, encoded WebP
 *  (JPEG fallback) at 0.85. Screenshots stay perfectly legible; a 4MB phone
 *  photo drops to a few hundred KB. */
async function downscale(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = url;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(img, 0, 0, w, h);
    let out = canvas.toDataURL('image/webp', 0.85);
    if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/jpeg', 0.85);
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function FeedbackForm() {
  const [state, setState] = useState<State>('idle');
  const [kind, setKind] = useState<Kind>('bug');
  const [form, setForm] = useState({ message: '', page: '', name: '', email: '' });
  const [images, setImages] = useState<string[]>([]); // downscaled data URLs
  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function pickImages(e: React.ChangeEvent<HTMLInputElement>) {
    setImgError('');
    const files = Array.from(e.target.files ?? []);
    if (fileRef.current) fileRef.current.value = ''; // let the same file be re-picked
    if (!files.length) return;

    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setImgError(`Up to ${MAX_IMAGES} images.`);
      return;
    }
    const valid = files.filter((f) => /^image\/(png|jpeg|webp)$/.test(f.type));
    const take = valid.slice(0, room);
    if (valid.length < files.length) setImgError('PNG, JPG or WebP only; other files were skipped.');
    else if (valid.length > room) setImgError(`Only ${MAX_IMAGES} images max; the extra ones were skipped.`);

    setImgBusy(true);
    const done: string[] = [];
    for (const f of take) {
      try {
        const d = await downscale(f);
        if (d) done.push(d);
      } catch {
        /* skip a file that won't decode */
      }
    }
    setImages((prev) => [...prev, ...done].slice(0, MAX_IMAGES));
    setImgBusy(false);
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, k) => k !== i));
    setImgError('');
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
          images,
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
      <div className="glass-panel state-in rounded-2xl p-8">
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
            className={`press rounded-full border px-4 py-2 text-sm ${
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

      {/* optional screenshots (up to MAX_IMAGES, downscaled in the browser) */}
      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={pickImages} className="hidden" id="fb-shot" />
        {images.map((src, i) => (
          <span key={i} className="inline-flex items-center gap-2 rounded-2xl border border-line bg-ink/50 p-2 pr-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Screenshot ${i + 1} to attach`} className="h-12 w-12 rounded-lg object-cover" />
            <button type="button" onClick={() => removeImage(i)} aria-label={`Remove screenshot ${i + 1}`} className="text-fog transition-colors hover:text-white">
              <X size={15} />
            </button>
          </span>
        ))}
        {images.length < MAX_IMAGES && (
          <label
            htmlFor="fb-shot"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-ink/50 px-4 py-2 text-sm text-fog transition-colors hover:border-stroxx-blue/50 hover:text-white"
          >
            <ImagePlus size={15} /> {imgBusy ? 'Adding…' : images.length ? 'Add another' : 'Attach screenshots (optional)'}
          </label>
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
        {state === 'error' && <span className="state-in text-sm text-fog">That did not go through. Try again in a minute.</span>}
        {state === 'offline' && (
          <span className="state-in text-sm text-fog">
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
