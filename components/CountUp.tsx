'use client';
import { useEffect, useRef, useState } from 'react';

/** Counts up to `value` when scrolled into view. Keeps a prefix/suffix (e.g. "1.400+"). */
export default function CountUp({
  value,
  prefix = '',
  suffix = '',
  duration = 1400,
  className = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          // reduced motion: land on the final number instantly, no count
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setN(value);
            return;
          }
          const start = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(eased * value));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{n.toLocaleString('da-DK')}{suffix}
    </span>
  );
}
