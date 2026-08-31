'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import Accent from '@/components/Accent';
import { ArrowRight, Plus, X } from 'lucide-react';

/** Interactive hotspot image: one photo, numbered points, a card per point.
 *
 *  Reusable across the site (landing/campaign sections, the Monthly lineup
 *  hero, product pages). Positions arrive as percentages from the CMS, so the
 *  spots sit in the same place at every screen size.
 *
 *  Interaction: click or tap a marker to open its card, click again (or the
 *  close button, or Escape, or anywhere outside) to shut it. On a fine pointer
 *  hovering opens it too, which is what a mouse user expects, but the click
 *  path is the contract so touch and keyboard behave identically. Each marker
 *  is a real <button> with aria-expanded and aria-controls, so a screen reader
 *  announces the picture as a list of points rather than as decoration. */

export type HotspotSpot = {
  _key?: string;
  title?: string;
  body?: string;
  /** 0-100, percentage of the image box. */
  x?: number;
  y?: number;
  /** Resolved on the server: the product this spot points at. */
  productName?: string;
  productHref?: string;
  /** Plain link, used when there is no product. */
  href?: string;
};

export default function HotspotImage({
  src,
  alt = '',
  spots,
  fit = 'cover',
  ratio = 'aspect-[16/10]',
  className = '',
}: {
  src: string;
  alt?: string;
  spots: HotspotSpot[];
  /** 'contain' for a cut-out product shot that must not be cropped. */
  fit?: 'cover' | 'contain';
  /** Tailwind aspect class for the frame. */
  ratio?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const points = (spots ?? []).filter((s) => s && (s.title || s.body));

  /* close on Escape and on a click outside the picture */
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  if (!src) return null;

  return (
    <div
      ref={wrap}
      className={`relative w-full overflow-hidden rounded-2xl ${ratio} ${className} ${
        /* a cut-out product shot needs a ground under it, or it floats */
        fit === 'contain' ? 'border border-white/10 bg-white/[0.03]' : ''
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`absolute inset-0 h-full w-full select-none ${fit === 'contain' ? 'object-contain p-6 md:p-10' : 'object-cover'}`}
      />

      {points.map((s, i) => {
        const x = Math.max(0, Math.min(100, s.x ?? 50));
        const y = Math.max(0, Math.min(100, s.y ?? 50));
        const isOpen = open === i;
        const cardId = `${baseId}-spot-${i}`;
        /* flip the card to the other side near an edge so it never leaves the frame */
        const flipX = x > 60;
        const flipY = y > 62;
        const link = s.productHref || s.href;
        return (
          <div key={s._key ?? i} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={cardId}
              aria-label={s.title || `Detail ${i + 1}`}
              onClick={() => setOpen(isOpen ? null : i)}
              onMouseEnter={() => {
                if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setOpen(i);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full border backdrop-blur-sm transition-colors ${
                isOpen ? 'border-white/70 bg-stroxx-blue text-white' : 'border-white/60 bg-black/45 text-white hover:bg-stroxx-blue'
              }`}
            >
              {/* the ring only pulses while the card is shut, and never for reduced motion */}
              {!isOpen && (
                <span className="pointer-events-none absolute inset-0 rounded-full border border-white/50 motion-safe:animate-ping" aria-hidden />
              )}
              {isOpen ? <X size={14} /> : <Plus size={14} />}
            </button>

            <div
              id={cardId}
              role="dialog"
              aria-label={s.title || `Detail ${i + 1}`}
              hidden={!isOpen}
              className={`absolute z-10 w-[min(17rem,70vw)] rounded-xl border border-white/15 bg-black/85 p-4 text-left backdrop-blur-md shadow-xl ${
                flipX ? '-translate-x-full -ml-5' : 'ml-5'
              } ${flipY ? '-translate-y-full -mt-5' : 'mt-5'}`}
            >
              <div className="text-white text-sm font-medium leading-snug">
                <Accent text={s.title} />
              </div>
              {s.body && (
                <p className="mt-2 text-fog text-[13px] leading-relaxed">
                  <Accent text={s.body} />
                </p>
              )}
              {link && (
                <Link
                  href={link}
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-stroxx-blue hover:text-white transition-colors"
                >
                  {s.productName || 'Read more'} <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
