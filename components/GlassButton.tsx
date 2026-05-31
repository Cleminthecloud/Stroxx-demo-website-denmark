'use client';
import Link from 'next/link';
import { useRef } from 'react';

/** Apple-glass CTA: frosted blue fill, animated edge-light, a soft blue glow
 *  that follows the cursor, edge reflection + drop shadow. `primary` carries the
 *  blue fill; `ghost` is the same glass with almost no fill (secondary). */
export default function GlassButton({
  href,
  children,
  variant = 'primary',
  external = false,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  external?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  const cls = `glass-cta ${variant === 'ghost' ? 'glass-cta--ghost' : ''} ${className}`;
  const inner = (<><span className="glass-cta__glow" aria-hidden />{children}</>);

  const isInternal = !external && (href.startsWith('/') || href.startsWith('#'));
  if (isInternal && !href.startsWith('#')) {
    return <Link ref={ref as never} href={href} onMouseMove={onMove} className={cls}>{inner}</Link>;
  }
  return (
    <a ref={ref} href={href} onMouseMove={onMove} className={cls}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {inner}
    </a>
  );
}
