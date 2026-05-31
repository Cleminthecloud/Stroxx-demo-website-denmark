'use client';
import { useEffect, useRef } from 'react';

/** The bag: falls in from the viewer's POV (quick, motion-blurred) with a dust
 *  puff + UI jolt on impact, then travels / scales / rotates between scroll
 *  keyframes — like the device on midlife.engineering — with a dynamic shadow
 *  that reads against a soft light pool. All viewport-relative.
 *  Swap BAG_SRC for a new render; nothing else changes. */
const BAG_SRC = '/Images/bag_top_clean.png';
const BAG_AR = 1127 / 1395;

type Stop = { p: number; x: number; y: number; s: number; r: number; o: number };
const STOPS: Stop[] = [
  { p: 0.0, x: 0, y: 14, s: 1.04, r: 0, o: 1 },
  { p: 0.11, x: 20, y: -2, s: 0.82, r: 5, o: 1 },
  { p: 0.23, x: -20, y: 3, s: 0.84, r: -5, o: 1 },
  { p: 0.35, x: 19, y: 2, s: 0.88, r: 5, o: 1 },
  { p: 0.44, x: 8, y: 14, s: 0.94, r: 0, o: 0 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function sample(p: number): Omit<Stop, 'p'> {
  if (p <= STOPS[0].p) return STOPS[0];
  if (p >= STOPS[STOPS.length - 1].p) return STOPS[STOPS.length - 1];
  let i = 0;
  while (i < STOPS.length - 1 && p > STOPS[i + 1].p) i++;
  const a = STOPS[i], b = STOPS[i + 1];
  const t = (p - a.p) / (b.p - a.p);
  const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), s: lerp(a.s, b.s, e), r: lerp(a.r, b.r, e), o: lerp(a.o, b.o, e) };
}

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number };

export default function BagScroller() {
  const bag = useRef<HTMLImageElement>(null);
  const spill = useRef<HTMLDivElement>(null);
  const pool = useRef<HTMLDivElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);
  const cur = useRef({ x: 0, y: 14, s: 1.04, r: 0, o: 1, lastY: 14 });

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    const ENTER = 850;
    let puffed = false;
    const parts: P[] = [];
    const dctx = dust.current?.getContext('2d') || null;
    const sizeDust = () => { if (dust.current) { dust.current.width = innerWidth; dust.current.height = innerHeight; } };
    sizeDust();
    addEventListener('resize', sizeDust);

    const spawnPuff = () => {
      const c = cur.current;
      const bagW = Math.min(0.62 * innerWidth, 980) * c.s;
      const bagH = bagW * BAG_AR;
      const cx = innerWidth / 2 + (c.x / 100) * innerWidth;
      const baseY = innerHeight / 2 + (c.y / 100) * innerHeight + bagH * 0.42;
      for (let i = 0; i < 54; i++) {
        const sp = 2 + Math.random() * 6;
        const dir = Math.random() < 0.5 ? -1 : 1;
        parts.push({
          x: cx + (Math.random() - 0.5) * bagW * 0.8,
          y: baseY + (Math.random() - 0.5) * 16,
          vx: dir * sp * (0.4 + Math.random()),
          vy: -Math.random() * 3 - 0.5,
          life: 1, max: 55 + Math.random() * 55, r: 16 + Math.random() * 46,
        });
      }
    };
    let shakeT0 = -1;

    let raf = 0;
    const loop = (now: number) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      const tgt = sample(p);
      const c = cur.current;
      c.x = lerp(c.x, tgt.x, 0.1); c.y = lerp(c.y, tgt.y, 0.1);
      c.s = lerp(c.s, tgt.s, 0.1); c.r = lerp(c.r, tgt.r, 0.1); c.o = lerp(c.o, tgt.o, 0.12);

      let entY = 0, blur = 0;
      if (!reduce) {
        const et = Math.min(1, (now - t0) / ENTER);
        const eased = 1 - Math.pow(1 - et, 3);
        entY = (1 - eased) * -125;
        blur = (1 - et) * 16; // motion blur during the fall
        if (!puffed && et >= 0.9) { puffed = true; spawnPuff(); shakeT0 = now; }
      }
      const vy = c.y - c.lastY; c.lastY = c.y;
      const lift = Math.min(1, Math.max(0, (c.s - 0.7) / 0.4 - vy * 0.1 + (-entY) * 0.012));

      // decaying impact jolt — screen-space, applied only to the bag + pool
      // (no ancestor transform, so the fixed layer's containing block never changes → no blink)
      let shX = 0, shY = 0;
      if (shakeT0 >= 0) {
        const st = (now - shakeT0) / 430;
        if (st >= 1) shakeT0 = -1;
        else {
          const amp = (1 - st) * 6;
          shX = Math.sin((now - shakeT0) * 0.075) * amp;
          shY = Math.cos((now - shakeT0) * 0.095) * amp * 0.7;
        }
      }
      const jolt = `translate(${shX.toFixed(2)}px, ${shY.toFixed(2)}px) `;

      if (bag.current) {
        bag.current.style.transform = `${jolt}translate(-50%,-50%) translate(${c.x}vw, ${c.y + entY}vh) scale(${c.s}) rotate(${c.r}deg)`;
        bag.current.style.opacity = String(c.o);
        // shape-accurate CSS drop-shadow that grows as the bag lifts (stacked for depth)
        const off = 18 + lift * 34;
        const bl = 20 + lift * 34;
        const a1 = (0.55 - lift * 0.18).toFixed(2);
        const a2 = (0.4 - lift * 0.14).toFixed(2);
        bag.current.style.filter =
          `blur(${Math.max(0, blur).toFixed(2)}px) ` +
          `drop-shadow(0px ${(off * 0.5).toFixed(0)}px ${(bl * 0.6).toFixed(0)}px rgba(0,0,0,${a1})) ` +
          `drop-shadow(0px ${off.toFixed(0)}px ${bl.toFixed(0)}px rgba(0,0,0,${a2}))`;
      }
      if (pool.current) {
        const ps = c.s * (1.5 + lift * 0.4);
        pool.current.style.transform = `${jolt}translate(-50%,-50%) translate(${c.x}vw, ${c.y + 13}vh) scale(${ps}, ${ps * 0.32})`;
        pool.current.style.opacity = String(0.55 * c.o);
      }
      // the blue spill fades out together with the bag
      if (spill.current) spill.current.style.opacity = String(c.o);

      if (dctx && dust.current) {
        dctx.clearRect(0, 0, dust.current.width, dust.current.height);
        for (let i = parts.length - 1; i >= 0; i--) {
          const pt = parts[i];
          pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.05; pt.vx *= 0.985; pt.vy *= 0.985;
          pt.life -= 1 / pt.max; pt.r += 0.7;
          if (pt.life <= 0) { parts.splice(i, 1); continue; }
          const a = pt.life * 0.18;
          const grd = dctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.r);
          grd.addColorStop(0, `rgba(176,188,202,${a})`);
          grd.addColorStop(1, 'rgba(176,188,202,0)');
          dctx.fillStyle = grd;
          dctx.beginPath(); dctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); dctx.fill();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', sizeDust); document.body.style.transform = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[45] pointer-events-none select-none" aria-hidden>
      {/* stronger blue spill — fades out with the bag */}
      <div ref={spill} className="absolute inset-0" style={{ background: 'radial-gradient(42% 38% at 50% 52%, rgba(0,130,202,0.28), transparent 72%)' }} />
      {/* soft light pool so the shadow has something to fall on */}
      <div ref={pool} className="absolute left-1/2 top-1/2" style={{
        width: 'min(64vw, 1000px)', height: 'min(64vw, 1000px)',
        background: 'radial-gradient(ellipse 50% 36% at 50% 50%, rgba(120,170,210,0.16), rgba(120,170,210,0) 64%)',
        filter: 'blur(20px)', transform: 'translate(-50%,-50%)',
      }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={bag} src={BAG_SRC} alt="" className="absolute left-1/2 top-1/2 w-[min(62vw,980px)] will-change-transform" style={{ transform: 'translate(-50%,-50%)' }} />
      <canvas ref={dust} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
