'use client';
import { useEffect, useRef, useState } from 'react';
import KnockoutImage from '@/components/KnockoutImage';
import { bagTools, toolTexture, formatDKK } from '@/lib/data';
import { TOOLS, PANEL, FRONT_PANEL, BAG_BACK, BAG_AR } from '@/components/BagFill';

/* ──────────────────────────────────────────────────────────────────────────
   The homepage hero bag — it FALLS in from the viewer's POV (dust + impact
   shake), then TRAVELS the same zig-zag scroll path as before, and as it
   zig-zags down the page the tools FALL INTO it (staggered on scroll). The bag,
   tools, front-panel occluder, price tag, shadow and blue light are one group
   that follows the path; the tool-drops happen in the bag's local space so they
   always land inside it, wherever it has swung. Geometry is shared with the
   /bag-test rig (BagFill) so both stay in sync.
   ────────────────────────────────────────────────────────────────────────── */

type Stop = { p: number; x: number; y: number; s: number; r: number; o: number };
const STOPS: Stop[] = [
  { p: 0.0, x: 0, y: 12, s: 1.02, r: 0, o: 1 },
  { p: 0.11, x: 20, y: -2, s: 0.82, r: 5, o: 1 },
  { p: 0.23, x: -20, y: 3, s: 0.84, r: -5, o: 1 },
  { p: 0.35, x: 19, y: 2, s: 0.88, r: 5, o: 1 },
  { p: 0.44, x: 8, y: 14, s: 0.94, r: 0, o: 0 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutBack = (t: number) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
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

// tools fill while the bag travels — staggered between these scroll fractions,
// finishing before the bag fades (~0.40)
const FILL_START = 0.05, FILL_END = 0.33, DROP = 0.08, DROP_FROM = 78;

type Pt = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number };

export default function BagJourney() {
  const group = useRef<HTMLDivElement>(null);
  const bag = useRef<HTMLImageElement>(null);
  const spill = useRef<HTMLDivElement>(null);
  const pool = useRef<HTMLDivElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);
  const toolRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cur = useRef({ x: 0, y: 12, s: 1.02, r: 0, o: 1, lastY: 12 });
  const [landed, setLanded] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    const ENTER = 850;
    const N = TOOLS.length;
    let puffed = false;
    const parts: Pt[] = [];
    const gl = { x: cur.current.x, y: cur.current.y, vx: 0, vy: 0 };
    const dctx = dust.current?.getContext('2d') || null;
    const sizeDust = () => { if (dust.current) { dust.current.width = innerWidth; dust.current.height = innerHeight; } };
    sizeDust();
    addEventListener('resize', sizeDust);

    const bagBaseH = () => Math.min(0.70 * innerHeight, 980);
    const spawnPuff = () => {
      const c = cur.current;
      const bagH = bagBaseH() * c.s, bagW = bagH * BAG_AR;
      const cx = innerWidth / 2 + (c.x / 100) * innerWidth;
      const baseY = innerHeight / 2 + (c.y / 100) * innerHeight + bagH * 0.42;
      for (let i = 0; i < 54; i++) {
        const sp = 2 + Math.random() * 6;
        const dir = Math.random() < 0.5 ? -1 : 1;
        parts.push({ x: cx + (Math.random() - 0.5) * bagW * 0.8, y: baseY + (Math.random() - 0.5) * 16,
          vx: dir * sp * (0.4 + Math.random()), vy: -Math.random() * 3 - 0.5, life: 1, max: 55 + Math.random() * 55, r: 16 + Math.random() * 46 });
      }
    };
    let shakeT0 = -1, raf = 0;

    const loop = (now: number) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? clamp(scrollY / max) : 0;
      const tgt = sample(p);
      const c = cur.current;
      c.x = lerp(c.x, tgt.x, 0.1); c.y = lerp(c.y, tgt.y, 0.1);
      c.s = lerp(c.s, tgt.s, 0.1); c.r = lerp(c.r, tgt.r, 0.1); c.o = lerp(c.o, tgt.o, 0.12);

      let entY = 0, blur = 0;
      if (!reduce) {
        const et = Math.min(1, (now - t0) / ENTER);
        const eased = 1 - Math.pow(1 - et, 3);
        entY = (1 - eased) * -125;
        blur = (1 - et) * 16;
        if (!puffed && et >= 0.9) { puffed = true; spawnPuff(); shakeT0 = now; }
      }
      const vy = c.y - c.lastY; c.lastY = c.y;
      const lift = clamp((c.s - 0.7) / 0.4 - vy * 0.1 + (-entY) * 0.012);

      let shX = 0, shY = 0;
      if (shakeT0 >= 0) {
        const st = (now - shakeT0) / 430;
        if (st >= 1) shakeT0 = -1;
        else { const amp = (1 - st) * 6; shX = Math.sin((now - shakeT0) * 0.075) * amp; shY = Math.cos((now - shakeT0) * 0.095) * amp * 0.7; }
      }
      const jolt = `translate(${shX.toFixed(2)}px, ${shY.toFixed(2)}px) `;

      if (group.current) {
        group.current.style.transform = `${jolt}translate(-50%,-50%) translate(${c.x}vw, ${c.y + entY}vh) scale(${c.s}) rotate(${c.r}deg)`;
        group.current.style.opacity = String(c.o);
      }
      if (bag.current) {
        const off = 18 + lift * 34, bl = 20 + lift * 34;
        const a1 = (0.55 - lift * 0.18).toFixed(2), a2 = (0.4 - lift * 0.14).toFixed(2);
        bag.current.style.filter =
          `blur(${Math.max(0, blur).toFixed(2)}px) drop-shadow(0px ${(off * 0.5).toFixed(0)}px ${(bl * 0.6).toFixed(0)}px rgba(0,0,0,${a1})) drop-shadow(0px ${off.toFixed(0)}px ${bl.toFixed(0)}px rgba(0,0,0,${a2}))`;
      }

      // tools fall into the bag (local space) as it travels
      let count = 0;
      for (let i = 0; i < N; i++) {
        const node = toolRefs.current[i];
        if (!node) continue;
        const start = FILL_START + (i / N) * (FILL_END - FILL_START);
        const local = reduce ? 1 : clamp((p - start) / DROP);
        const e = local <= 0 ? 0 : easeOutBack(local);
        const fall = (1 - e) * DROP_FROM;
        const tblur = (1 - clamp(local / 0.6)) * 3;
        const wob = Math.sin(local * Math.PI) * (1 - local) * 4;
        node.style.opacity = local > 0 ? '1' : '0';
        node.style.transform = `translate(-50%,-50%) translateY(${-fall}vh) rotate(${TOOLS[i].rot + wob}deg)`;
        node.style.filter = tblur > 0.2 ? `blur(${tblur.toFixed(1)}px)` : 'none';
        const sh = node.querySelector('[data-shadow]') as HTMLElement | null;
        if (sh) sh.style.opacity = String(clamp((local - 0.4) / 0.6) * 0.45);
        if (local > 0.5) count++;
      }
      setLanded((prev) => (prev === count ? prev : count));

      if (pool.current) {
        const ps = c.s;
        pool.current.style.transform = `${jolt}translate(-50%,-50%) translate(${c.x}vw, ${c.y + 16}vh) scale(${ps}, ${ps * 0.5})`;
        pool.current.style.opacity = String(0.5 * c.o);
      }
      gl.vx += (c.x - gl.x) * 0.03; gl.vy += (c.y - gl.y) * 0.03 + 0.012;
      gl.vx *= 0.92; gl.vy *= 0.92; gl.x += gl.vx; gl.y += gl.vy;
      if (spill.current) {
        spill.current.style.transform = `translate(-50%,-50%) translate(${gl.x}vw, ${gl.y}vh)`;
        spill.current.style.opacity = String(c.o);
      }

      if (dctx && dust.current) {
        dctx.clearRect(0, 0, dust.current.width, dust.current.height);
        for (let i = parts.length - 1; i >= 0; i--) {
          const pt = parts[i];
          pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.05; pt.vx *= 0.985; pt.vy *= 0.985;
          pt.life -= 1 / pt.max; pt.r += 0.7;
          if (pt.life <= 0) { parts.splice(i, 1); continue; }
          const a = pt.life * 0.18;
          const grd = dctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.r);
          grd.addColorStop(0, `rgba(176,188,202,${a})`); grd.addColorStop(1, 'rgba(176,188,202,0)');
          dctx.fillStyle = grd; dctx.beginPath(); dctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); dctx.fill();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', sizeDust); };
  }, []);

  const total = TOOLS.slice(0, landed).reduce((s, t) => s + (bagTools.find((b) => b.id === t.id)?.price ?? 0), 0);

  return (
    <div className="fixed inset-0 z-[45] pointer-events-none select-none" aria-hidden>
      {/* elastic blue light that trails the bag */}
      <div ref={spill} className="absolute left-1/2 top-1/2 will-change-transform" style={{
        width: 'min(90vw, 1300px)', height: 'min(82vh, 1020px)',
        background: 'radial-gradient(42% 42% at 50% 50%, rgba(0,130,202,0.28), transparent 70%)', transform: 'translate(-50%,-50%)' }} />
      {/* soft shadow pool under the bag */}
      <div ref={pool} className="absolute left-1/2 top-1/2" style={{
        width: 'min(46vh, 680px)', height: 'min(46vh, 680px)',
        background: 'radial-gradient(ellipse 50% 36% at 50% 50%, rgba(120,170,210,0.16), rgba(120,170,210,0) 64%)',
        filter: 'blur(20px)', transform: 'translate(-50%,-50%)' }} />

      {/* the travelling + filling bag group */}
      <div ref={group} className="absolute left-1/2 top-1/2 will-change-transform"
        style={{ height: 'min(70vh, 980px)', aspectRatio: String(BAG_AR), transform: 'translate(-50%,-50%)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={bag} src={BAG_BACK} alt="" className="absolute inset-0 h-full w-full object-contain" />

        {TOOLS.map((t, i) => (
          <div key={t.id + '-' + i} ref={(n) => { toolRefs.current[i] = n; }} className="absolute will-change-transform"
            style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.w}%`, height: `${t.w / BAG_AR * 0.62}%`,
              zIndex: 10 + i, opacity: 0, transform: 'translate(-50%,-50%) translateY(-78vh)' }}>
            <div data-shadow className="pointer-events-none absolute left-1/2 -translate-x-1/2"
              style={{ bottom: '-6%', width: '80%', height: '16%', opacity: 0, background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.55), transparent 70%)', filter: 'blur(7px)' }} />
            <KnockoutImage src={toolTexture(t.id)} alt="" maxSize={520} className="h-full w-full" />
          </div>
        ))}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FRONT_PANEL} alt="" className="absolute select-none"
          style={{ left: `${PANEL.left}%`, top: `${PANEL.top}%`, width: `${PANEL.width}%`, zIndex: 40 }} />

        {/* price tag — rides along on the bag */}
        <div className="absolute" style={{ right: '-6%', bottom: '20%', zIndex: 50 }}>
          <div className="rounded-2xl px-4 py-2.5 backdrop-blur-xl border border-white/[0.12] text-right"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 12px 30px rgba(0,0,0,0.5), 0 0 28px rgba(0,130,202,0.14)' }}>
            <div className="text-[9px] uppercase tracking-[0.18em] text-fog mb-1">I posen</div>
            <div className="h-display text-white text-xl leading-none tabular-nums">
              {formatDKK(total)}<span className="text-fog text-[11px] ml-1">kr</span>
            </div>
            <div className="mt-1.5 text-[10px] tracking-wide">
              <span className="text-stroxx-blue font-semibold tabular-nums">{landed}</span>
              <span className="text-fog/60"> / {TOOLS.length} værktøjer</span>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={dust} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
