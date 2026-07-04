'use client';

import { useEffect, useState } from 'react';

/** Thin blue reading-progress bar under the nav on articles: the quiet
 *  long-form cue that says "this is a read, settle in". */
export default function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[120] h-[3px] pointer-events-none">
      <div
        className="h-full origin-left"
        style={{
          transform: `scaleX(${p})`,
          background: 'linear-gradient(90deg, #0082CA, #35b6ff)',
          boxShadow: '0 0 12px rgba(0,130,202,0.55)',
        }}
      />
    </div>
  );
}
