'use client';
import { useRef } from 'react';

/** Glass pill with icon + label and the same frosted look + cursor-following
 *  STROXX-blue highlight as the buy button. Used for specialist contact. */
export default function GlassLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
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
      onMouseMove={onMove}
      className="glass-btn inline-flex items-center gap-2 px-4 py-2 text-sm text-fog hover:text-white"
    >
      <span className="glass-btn__glow" aria-hidden />
      {children}
      <span className="relative">{label}</span>
    </a>
  );
}
