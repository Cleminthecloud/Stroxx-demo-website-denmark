'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';

type Img = { src: string; label: string };

/** Brand photo grid with an in-page lightbox: click to open an overlay, page
 *  with the arrows or ← / →, close with Esc or the backdrop. Keeps the editor
 *  on the guide instead of bouncing them to a raw image URL. */
export default function PhotoGallery({ images }: { images: Img[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length)), [images.length]);
  const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  const cur = open === null ? null : images[open];

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((g, i) => (
          <div key={g.src} className="glass glass-card glass-panel--glow rounded-2xl overflow-hidden">
            <button type="button" onClick={() => setOpen(i)} className="block relative group w-full" aria-label={`Open ${g.label}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.label} className="w-full h-56 object-cover" />
              <span className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors grid place-items-center opacity-0 group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 text-white text-sm"><Maximize2 size={15} /> View</span>
              </span>
            </button>
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <span className="text-white text-sm truncate">{g.label}</span>
              <a href={g.src} download className="inline-flex items-center gap-1.5 text-fog text-xs hover:text-white transition-colors shrink-0">
                <Download size={13} /> Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {cur && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ background: 'rgba(6,7,9,0.94)', backdropFilter: 'blur(2px)' }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={cur.label}
        >
          <button type="button" onClick={close} aria-label="Close" className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full border border-line bg-ink/60 text-fog hover:text-white hover:border-stroxx-blue/50 transition-colors">
            <X size={18} />
          </button>
          {images.length > 1 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous" className="absolute left-4 md:left-8 grid h-11 w-11 place-items-center rounded-full border border-line bg-ink/60 text-fog hover:text-white hover:border-stroxx-blue/50 transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.src} alt={cur.label} className="max-w-[92vw] max-h-[78vh] object-contain rounded-lg" style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }} />
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white">{cur.label}</span>
              {images.length > 1 && <span className="text-fog/50">{(open ?? 0) + 1} / {images.length}</span>}
              <a href={cur.src} download className="inline-flex items-center gap-1.5 text-fog hover:text-white transition-colors">
                <Download size={14} /> Download
              </a>
            </div>
          </div>
          {images.length > 1 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next" className="absolute right-4 md:right-8 grid h-11 w-11 place-items-center rounded-full border border-line bg-ink/60 text-fog hover:text-white hover:border-stroxx-blue/50 transition-colors">
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
