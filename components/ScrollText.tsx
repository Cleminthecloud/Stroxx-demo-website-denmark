'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  (window as any).ScrollTrigger = ScrollTrigger; // let SmoothScroll sync it with Lenis
}

/** Splits text into words that start dim and lighten to full as the block
 *  scrolls through the viewport (scrubbed). Use '\n' to force a line break.
 *  Wrap a word in asterisks (*navnet.*) to render it in STROXX blue. */
export default function ScrollText({
  text,
  as: Tag = 'p',
  className = '',
  start = 'top 85%',
  end = 'top 40%',
}: {
  text: string;
  as?: any;
  className?: string;
  start?: string;
  end?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const words = el.querySelectorAll('[data-w]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start, end, scrub: true } }
      );
    }, el);
    return () => ctx.revert();
  }, [text, start, end]);

  const tokens = text.split(' ');
  return (
    <Tag ref={ref as any} className={className}>
      {tokens.map((t, i) => {
        if (t === '\n') return <br key={i} />;
        const accent = t.length > 2 && t.startsWith('*') && t.endsWith('*');
        const word = accent ? t.slice(1, -1) : t;
        return (
          <span key={i} data-w className={`inline-block${accent ? ' text-stroxx-blue' : ''}`}>
            {word}
            {i < tokens.length - 1 && tokens[i + 1] !== '\n' ? ' ' : ''}
          </span>
        );
      })}
    </Tag>
  );
}
