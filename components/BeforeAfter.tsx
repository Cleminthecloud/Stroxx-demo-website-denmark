'use client';
import { useRef, useState } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

/** Before/after comparison: two stacked images, the top one clipped at a
 *  draggable divider. Proof beats claims, so let people SEE the difference.
 *  Pointer events cover mouse + touch; the hidden range input covers
 *  keyboard and screen readers. No blur/drop-shadow on the big layers
 *  (the iOS Safari white-box rule); the 44px handle is small enough. */

export default function BeforeAfter({
  before,
  after,
  beforeAlt = '',
  afterAlt = '',
  beforeLabel = 'Before',
  afterLabel = 'After',
}: {
  before: string;
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const [dragging, setDragging] = useState(false);

  function moveTo(clientX: number) {
    const r = ref.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPct(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }

  return (
    <div
      ref={ref}
      className="relative aspect-[16/10] cursor-ew-resize touch-none select-none overflow-hidden rounded-xl border border-line"
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragging(true);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => dragging && moveTo(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt={afterAlt} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={beforeAlt} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      </div>

      <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-line bg-ink/70 px-3 py-1 text-xs uppercase tracking-wider text-white/85">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-line bg-ink/70 px-3 py-1 text-xs uppercase tracking-wider text-white/85">
        {afterLabel}
      </span>

      {/* divider + handle */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pct}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white/75" />
        <div className="absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-ink/70 text-white backdrop-blur-sm">
          <ChevronsLeftRight size={18} strokeWidth={2} />
        </div>
      </div>

      {/* keyboard + screen reader control */}
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(pct)}
        onChange={(e) => setPct(Number(e.target.value))}
        aria-label="Compare before and after"
        className="absolute bottom-3 left-1/2 w-44 -translate-x-1/2 opacity-0 focus-visible:opacity-100"
      />
    </div>
  );
}
