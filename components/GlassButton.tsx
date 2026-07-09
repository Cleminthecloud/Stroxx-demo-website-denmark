'use client';
import Link from 'next/link';
import { useRef } from 'react';

/** The single STROXX CTA primitive — Apple-glass: frosted blue fill, animated
 *  edge-light, a soft blue glow that follows the cursor, edge reflection + drop
 *  shadow.
 *
 *  Button hierarchy (see MOTION.md › Buttons):
 *    • variant="primary"  → the one decisive action per section (blue fill)
 *    • variant="ghost"    → secondary / supporting action (no fill)
 *    • size="sm"          → compact, for product cards & dense rows
 *
 *  Renders <Link> for internal routes, <a> for external/anchor links, or a
 *  <button type="submit"> when `submit` is set (for forms). */
export default function GlassButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  external = false,
  submit = false,
  onClick,
  className = '',
}: {
  href?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
  external?: boolean;
  submit?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
    // magnetic lean: the button eases a few px toward the cursor (capped) —
    // the .25s transform transition supplies the soft pull, CSS supplies the
    // hover lift on top via calc(). Skipped under prefers-reduced-motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cap = 3;
    const mx = Math.max(-cap, Math.min(cap, (e.clientX - (r.left + r.width / 2)) * 0.12));
    const my = Math.max(-cap, Math.min(cap, (e.clientY - (r.top + r.height / 2)) * 0.18));
    el.style.setProperty('--tx', `${mx.toFixed(2)}px`);
    el.style.setProperty('--ty', `${my.toFixed(2)}px`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tx', '0px');
    el.style.setProperty('--ty', '0px');
  };
  const cls = [
    'glass-cta',
    variant === 'ghost' ? 'glass-cta--ghost' : '',
    size === 'sm' ? 'glass-cta--sm' : '',
    className,
  ].filter(Boolean).join(' ');
  const inner = (<><span className="glass-cta__glow" aria-hidden />{children}</>);

  if (submit || onClick || !href) {
    return (
      <button
        ref={ref as never}
        type={submit ? 'submit' : 'button'}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={cls}
      >
        {inner}
      </button>
    );
  }

  const isInternal = !external && (href.startsWith('/') || href.startsWith('#'));
  if (isInternal && !href.startsWith('#')) {
    return <Link ref={ref as never} href={href} onMouseMove={onMove} onMouseLeave={onLeave} className={cls}>{inner}</Link>;
  }
  return (
    <a ref={ref as never} href={href} onMouseMove={onMove} onMouseLeave={onLeave} className={cls}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {inner}
    </a>
  );
}
