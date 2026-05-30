'use client';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

/** Glass buy CTA — frosted glass with a STROXX-blue specular highlight that
 *  follows the cursor on hover (à la Petr Knoll's glass button), lucide icons. */
export default function BuyButton({
  href,
  children = 'Køb hos Carl Ras',
  className = '',
  size = 'md',
}: {
  href: string;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  const pad = size === 'sm' ? 'text-xs py-2 px-3.5' : 'text-[13px]';
  const ico = size === 'sm' ? 14 : 16;
  return (
    <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" onMouseMove={onMove} className={`glass-btn ${pad} ${className}`}>
      <span className="glass-btn__glow" aria-hidden />
      <span>{children}</span>
      <ArrowRight size={ico} strokeWidth={2} className="arr shrink-0" />
    </a>
  );
}
