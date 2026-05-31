'use client';
import { useEffect, useRef } from 'react';

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
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => el.classList.add('is-in'), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  const dir = from === 'up' ? '' : `reveal--${from}`;
  return (
    <Tag ref={ref as any} className={`reveal ${dir} ${className}`}>
      {children}
    </Tag>
  );
}
