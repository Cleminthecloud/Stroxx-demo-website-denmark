'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Horizontal scroll-snap row with prev/next arrows. The arrows live in the
 *  header row next to the title, page by ~80% of the viewport, and disable
 *  at the ends; touch users keep swiping like nothing happened. Server
 *  components render the cards, this shell owns the scrolling. */

export default function CarouselRow({ title, children }: { title?: string; children: React.ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(false);

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    update();
    const el = scroller.current;
    el?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const btn =
    'grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] border border-white/15 text-fog hover:text-white hover:border-stroxx-blue/60 transition-colors disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-fog cursor-pointer disabled:cursor-default';

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-5">
        {title ? <div className="eyebrow !mb-0">{title}</div> : <span />}
        {(canL || canR) && (
          <div className="flex gap-2">
            <button onClick={() => page(-1)} disabled={!canL} aria-label="Previous" className={btn}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => page(1)} disabled={!canR} aria-label="Next" className={btn}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      <div ref={scroller} data-lenis-prevent
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-1 px-1">
        {children}
      </div>
    </div>
  );
}
