'use client';
import { useEffect, useRef, useState } from 'react';

/** Final CTA headline. Starts as "Try it." and, once it scrolls near the
 *  middle of the viewport, a STROXX-blue " Now." slides out; because the line
 *  is centre-justified, the whole thing recentres as the word appears. */
export default function ProvDet() {
  const ref = useRef<HTMLHeadingElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const mid = window.innerHeight / 2;
      if (Math.abs(center - mid) < window.innerHeight * 0.22) setOn(true);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <h2
      ref={ref}
      className="h-display text-white text-[clamp(3rem,11vw,11rem)] leading-[0.86] mb-12 flex items-baseline justify-center whitespace-nowrap"
    >
      <span>Try it.</span>
      <span
        className="text-stroxx-blue inline-block overflow-hidden transition-all duration-700 ease-out"
        style={{
          maxWidth: on ? '5ch' : '0ch',
          marginLeft: on ? '0.28em' : '0em',
          opacity: on ? 1 : 0,
          transform: on ? 'translateX(0)' : 'translateX(-0.35em)',
        }}
      >
        Now.
      </span>
    </h2>
  );
}
