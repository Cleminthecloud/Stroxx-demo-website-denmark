'use client';
import { useRef } from 'react';

/** Circular glass icon button with the same frosted look + cursor-following
 *  STROXX-blue highlight as the buy button. */
export default function GlassIcon({
  href,
  label,
  children,
  size = 40,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  size?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  return (
    <a
      ref={ref}
      href={href}
      aria-label={label}
      onMouseMove={onMove}
      className="glass-btn !p-0 grid place-items-center text-fog hover:text-white"
      style={{ width: size, height: size }}
    >
      <span className="glass-btn__glow" aria-hidden />
      {children}
    </a>
  );
}
