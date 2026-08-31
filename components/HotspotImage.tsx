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
 *  Several ANGLES are supported: each carries its own photo and its own spots,
 *  and a switcher appears above the picture only when there is more than one.
 *  Switching angles closes any open card, because a card anchored to a point on
 *  the front of a tool means nothing over a photo of its back.
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

export type HotspotAngle = {
  label: string;
  src: string;
  alt?: string;
  fit?: 'cover' | 'contain';
  spots: HotspotSpot[];
};

export default function HotspotImage({
  angles,
  ratio = 'aspect-[16/10]',
  className = '',
}: {
  /** One entry per angle. One is the common case and shows no switcher. */
  angles: HotspotAngle[];
  /** Tailwind aspect class for the frame. */
  ratio?: string;
  className?: string;
}) {
  const [view, setView] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const baseId = useId();

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

  if (!angles?.length) return null;
  const active = angles[Math.min(view, angles.length - 1)];
  const points = (active.spots ?? []).filter((s) => s && (s.title || s.body));
  const contain = active.fit === 'contain';

  return (
    <div ref={wrap} className={className}>
      {/* angle switcher — only earns its space when there is a choice */}
      {angles.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Choose an angle">
          {angles.map((a, i) => (
            <button
              key={a.label + i}
              type="button"
              role="tab"
              aria-selected={i === view}
              onClick={() => {
                setView(i);
                setOpen(null); // a card pinned to the front makes no sense on the back
              }}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                i === view
                  ? 'border-stroxx-blue bg-stroxx-blue/15 text-white'
                  : 'border-white/15 text-fog hover:border-white/35 hover:text-white'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      <div
        className={`relative w-full overflow-hidden rounded-2xl ${ratio} ${
          /* a cut-out product shot needs a ground under it, or it floats */
          contain ? 'border border-white/10 bg-white/[0.03]' : ''
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active.src}
          src={active.src}
          alt={active.alt || ''}
          draggable={false}
          className={`absolute inset-0 h-full w-full select-none ${contain ? 'object-contain p-6 md:p-10' : 'object-cover'}`}
        />

        {points.map((s, i) => {
          const x = Math.max(0, Math.min(100, s.x ?? 50));
          const y = Math.max(0, Math.min(100, s.y ?? 50));
          const isOpen = open === i;
          const cardId = `${baseId}-${view}-spot-${i}`;
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
                /* Closed markers are SOLID BLUE, not a translucent dark disc: on
                   a dark photograph (a black tool on the ink background is the
                   common case here) a see-through marker all but disappears, and
                   a control nobody can see is not a control. Open flips to white
                   so the active point reads at a glance. */
                className={`absolute -translate-x-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full border-2 transition-colors ${
                  isOpen
                    ? 'border-white bg-white text-ink'
                    : 'border-white/90 bg-stroxx-blue text-white hover:bg-white hover:text-ink'
                }`}
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.55)' }}
              >
                {/* the ring only pulses while the card is shut, and never for reduced motion */}
                {!isOpen && (
                  <span className="pointer-events-none absolute -inset-1 rounded-full border-2 border-stroxx-blue/70 motion-safe:animate-ping" aria-hidden />
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
    </div>
  );
}
