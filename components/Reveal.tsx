'use client';
import { useEffect, useRef, useState } from 'react';

type From = 'up' | 'down' | 'left' | 'right' | 'far-left' | 'far-right';

/** Scroll-triggered reveal. `from` chooses the entrance direction:
 *  'up' (default, soft rise) · 'down' · 'left'/'right' (slide in horizontally,
 *  desktop only) · 'far-left'/'far-right' (longer slide for hero pieces).
 *  All variants share the brand ease + blur so motion stays one family. */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  from = 'up',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: From;
  as?: any;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    // Above-the-fold safety: if the element is already in view on mount, reveal
    // it straight away instead of waiting on the observer's first callback —
    // otherwise a hero slide (e.g. the product title/price/CTA) can stay hidden
    // until the user scrolls.
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.92 && r.bottom > 0) {
      const t = setTimeout(() => setShown(true), delay);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setShown(true), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, shown]);
  const dir = from === 'up' ? '' : `reveal--${from}`;
  return (
    <Tag ref={ref as any} className={`reveal ${dir} ${className} ${shown ? 'is-in' : ''}`}>
      {children}
    </Tag>
  );
}
