'use client';
import { useRef } from 'react';

/** Wraps a glass card and tracks the cursor as --gx/--gy (percent), driving:
 *  - a soft blue light pooled inside the card, blurred so it reads as light
 *    diffused through frosted glass (sits behind the cut-out product);
 *  - an edge specular that brightens the rim nearest the cursor — the Apple-
 *    glass refraction. Both are CSS-only spans; the only JS is setting two vars
 *    on pointer move (React delegates the handler, so 100s of cards are cheap). */
export default function GlassCardGlow({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={className}>
      <span className="glass-glow__light" aria-hidden />
      <span className="glass-glow__refract" aria-hidden />
      {children}
    </div>
  );
}
