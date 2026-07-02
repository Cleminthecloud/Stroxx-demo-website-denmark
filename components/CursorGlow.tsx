'use client';
import { useEffect, useRef } from 'react';

/** Soft STROXX-blue light that follows the cursor across its (relatively
 *  positioned) parent — with weight: the light lerps toward the pointer
 *  (same ~0.09 factor family as the scroll lerps) so it trails, catches up
 *  and settles instead of sticking to the cursor. Falls back to a pleasant
 *  off-centre rest position; reduced motion pins it there. */
export default function CursorGlow({
  className = '',
  size = '46% 48%',
  intensity = 0.24,
}: {
  className?: string;
  size?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // rest position (%, matches the CSS fallback)
    let cx = 66, cy = 46;      // current (what we paint)
    let tx = cx, ty = cy;      // target (where the cursor is)
    let raf = 0;

    const frame = () => {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      el.style.setProperty('--gx', `${cx.toFixed(2)}%`);
      el.style.setProperty('--gy', `${cy.toFixed(2)}%`);
      // converged → stop; the next pointermove restarts the loop
      if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05) { raf = 0; return; }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(${size} at var(--gx,66%) var(--gy,46%), rgba(0,130,202,${intensity}), transparent 70%)`,
      }}
    />
  );
}
