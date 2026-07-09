'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/** The STROXX guarantee seal: a peeling-sticker badge whose lines are supplied
 *  by the CMS (so each market/placement edits its own). Fixed 450px design that
 *  scales to fit its container; the text auto-fits so entered copy can never
 *  break out of the sticker, on any screen. The peel is masked with overflow so
 *  it can't spill outside the circle. Plays once when scrolled into view. */
export type GuaranteeSealProps = {
  line1?: string;
  connector?: string;
  line2?: string;
  subLine1?: string;
  subLine2?: string;
  /** hand-placed tilt in degrees, e.g. -8. 0 = straight. */
  tilt?: number;
  /** how far the corner peels, 0..0.5 (0.22 default). */
  peelDepth?: number;
  className?: string;
};

const FALLBACK = {
  line1: 'SATISFIED',
  connector: 'or',
  line2: 'REFUNDED',
  subLine1: 'Not happy with STROXX?',
  subLine2: 'Your money back, right away.',
};

export default function GuaranteeSeal({
  line1, connector, line2, subLine1, subLine2, tilt = -8, peelDepth = 0.22, className = '',
}: GuaranteeSealProps) {
  const root = useRef<HTMLDivElement>(null);
  const l1 = line1 || FALLBACK.line1;
  const cc = connector || FALLBACK.connector;
  const l2 = line2 || FALLBACK.line2;
  const s1 = subLine1 || FALLBACK.subLine1;
  const s2 = subLine2 || FALLBACK.subLine2;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = (sel: string) => el.querySelector(sel) as HTMLElement | null;
    const stage = q('.gseal-stage');
    const seal = q('.gseal');
    const text = q('.gseal-text');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const STOP = Math.min(0.5, Math.max(0, peelDepth ?? 0.22));

    const fitText = () => {
      if (!text) return;
      text.style.transform = 'none';
      let m = 0;
      el.querySelectorAll('.gseal-big,.gseal-sub').forEach((n) => { m = Math.max(m, (n as HTMLElement).offsetWidth); });
      const sc = Math.min(1, 300 / (m || 1));
      text.style.transform = sc < 1 ? `scale(${sc.toFixed(3)})` : 'none';
    };
    const fitSeal = () => {
      if (!stage || !seal) return;
      seal.style.transform = `rotate(${tilt ?? 0}deg) scale(${(stage.clientWidth / 470).toFixed(4)})`;
    };
    fitText();
    fitSeal();

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power1.inOut' } });
    tl.to(el.querySelector('.gseal-back .gseal-wrap'), { height: 225, top: 275, duration: .75 }, 0)
      .to(el.querySelector('.gseal-back-face'), { marginTop: -125, duration: .75 }, 0)
      .to(el.querySelector('.gseal-front .gseal-wrap'), { height: 175, duration: .75 }, 0)
      .to(el.querySelector('.gseal-front-face'), { marginTop: -225, duration: .75 }, 0);

    let io: IntersectionObserver | undefined;
    if (reduce) {
      tl.progress(STOP);
    } else {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            gsap.to(tl, { progress: STOP, duration: 1.5, delay: .2, ease: 'elastic.out(0.7,0.5)' });
            io?.disconnect();
          }
        });
      }, { threshold: 0.35 });
      io.observe(el);
    }

    const onResize = () => { fitSeal(); fitText(); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); io?.disconnect(); tl.kill(); };
  }, [l1, cc, l2, s1, s2, tilt, peelDepth]);

  return (
    <div ref={root} className={className}>
      <div className="gseal-stage">
        <div className="gseal">
          <div className="gseal-reveal gseal-wrap"><div className="gseal-circle gseal-recess" /></div>

          <div className="gseal-sticky gseal-front">
            <div className="gseal-wrap">
              <div className="gseal-circle gseal-front-face"><div className="gseal-grain" /><div className="gseal-ring" /></div>
            </div>
          </div>

          <div className="gseal-text">
            <div className="gseal-big">{l1}</div>
            <div className="gseal-big"><span className="gseal-conn">{cc}</span> {l2}</div>
            <div className="gseal-gap" />
            <div className="gseal-sub">{s1}</div>
            <div className="gseal-sub">{s2}</div>
          </div>

          <div className="gseal-holder">
            <div className="gseal-sticky gseal-back">
              <div className="gseal-wrap"><div className="gseal-circle gseal-back-face"><div className="gseal-grain" /></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
