'use client';
import { useEffect, useRef } from 'react';

/** Soft STROXX-blue light that follows the cursor across its (relatively
 *  positioned) parent. Falls back to a pleasant off-centre rest position. */
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
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return (
    <div
      ref={ref}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(${size} at var(--gx,66%) var(--gy,46%), rgba(0,130,202,${intensity}), transparent 70%)`,
        transition: 'background 0.12s linear',
      }}
    />
  );
}
