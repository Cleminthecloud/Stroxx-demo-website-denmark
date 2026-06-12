'use client';
import { useEffect, useRef, useState } from 'react';
import { bagTools, formatDKK } from '@/lib/data';
import { TOOLS, PANEL, FRONT_PANEL, BAG_BACK, BAG_AR } from '@/components/BagFill';

/* ──────────────────────────────────────────────────────────────────────────
   Homepage hero bag. It FALLS in from the viewer's POV (dust puff + impact
   shake), settles in the hero, and ALL the tools cascade into it on load.
   No scroll journey — the bag lives in the hero and scrolls away with the
   page. Geometry (BAG_AR, TOOLS, panel positions, price) is shared from
   BagFill so the bag stays consistent. The price tag tallies the tools as
   they land.
   ────────────────────────────────────────────────────────────────────────── */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutBack = (t: number) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

// fill timing (ms from mount): a beat to let the bag land, then tools cascade
const FILL_HOLD = 700, FILL_STAGGER = 130, FILL_DUR = 480, DROP_FROM = 82;

type Pt = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number };

export default function BagJourney() {
  const group = useRef<HTMLDivElement>(null);
  const bag = useRef<HTMLImageElement>(null);
  const spill = useRef<HTMLDivElement>(null);
  const pool = useRef<HTMLDivElement>(null);
  const dust = useRef<HTMLCanvasElement>(null);
  const toolRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [landed, setLanded] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Only play the fall-in/puff on a genuine top-of-page landing — on
    // back/forward nav the browser restores scroll and a mid-page puff looked wrong.
    const skipEntrance = reduce || window.scrollY > 4;
    // iOS Safari rasterises large blur/drop-shadow layers as opaque white when
    // they exceed GPU memory — so phones get NO css filter (pool div = shadow).
    const noFilter = window.matchMedia('(max-width: 1023px)').matches;
    // Fixed hero pose. y nudges the bag down so the headline reads above it.
    const POSE_Y = noFilter ? 18 : 16; // vh below centre
    const t0 = performance.now();
    const ENTER = 850;
    const N = TOOLS.length;
    let puffed = false;
    const parts: Pt[] = [];
    const dctx = dust.current?.getContext('2d') || null;
    const sizeDust = () => { if (dust.current) { dust.current.width = innerWidth; dust.current.height = innerHeight; } };
    sizeDust();
    addEventListener('resize', sizeDust);

    const bagBaseH = () => (noFilter ? (innerWidth * 0.75) / BAG_AR : Math.min(0.70 * innerHeight, 980));
    const BAG_S = 1.0;
    // visible tote bottom sits at 0.767 of the padded PNG height
    const TOTE_BASE = 0.767;
    const spawnPuff = () => {
      const bagH = bagBaseH() * BAG_S, bagW = bagH * BAG_AR;
      const cx = innerWidth / 2;
      const baseY = innerHeight / 2 + (POSE_Y / 100) * innerHeight + bagH * (TOTE_BASE - 0.5);
      for (let i = 0; i < 54; i++) {
        const sp = 2 + Math.random() * 6;
        const dir = Math.random() < 0.5 ? -1 : 1;
        parts.push({ x: cx + (Math.random() - 0.5) * bagW * 0.7, y: baseY + (Math.random() - 0.5) * 16,
          vx: dir * sp * (0.4 + Math.random()), vy: -Math.random() * 3 - 0.5, life: 1, max: 55 + Math.random() * 55, r: 16 + Math.random() * 46 });
      }
    };
    let shakeT0 = -1, raf = 0;

    const loop = (now: number) => {
      // entrance: bag drops in from above with a quick blur, then a puff + shake
      let entY = 0, blur = 0;
      if (!skipEntrance) {
        const et = Math.min(1, (now - t0) / ENTER);
        const eased = 1 - Math.pow(1 - et, 3);
        entY = (1 - eased) * -125;
        blur = (1 - et) * 16;
        if (!puffed && et >= 0.9) { puffed = true; spawnPuff(); shakeT0 = now; }
      }
      const lift = clamp((-entY) * 0.012); // brief lift while falling, settles to 0

      let shX = 0, shY = 0;
      if (shakeT0 >= 0) {
        const st = (now - shakeT0) / 430;
        if (st >= 1) shakeT0 = -1;
        else { const amp = (1 - st) * 6; shX = Math.sin((now - shakeT0) * 0.075) * amp; shY = Math.cos((now - shakeT0) * 0.095) * amp * 0.7; }
      }
      const jolt = `translate(${shX.toFixed(2)}px, ${shY.toFixed(2)}px) `;

      if (group.current) {
        group.current.style.transform = `${jolt}translate(-50%,-50%) translate(0vw, ${(POSE_Y + entY).toFixed(2)}vh) scale(${BAG_S})`;
      }
      if (bag.current && !noFilter) {
        const off = 16 + lift * 30, bl = 34 + lift * 40;
        const a1 = (0.5 - lift * 0.16).toFixed(2);
        bag.current.style.filter =
          `blur(${Math.max(0, blur).toFixed(2)}px) drop-shadow(0px ${off.toFixed(0)}px ${bl.toFixed(0)}px rgba(0,0,0,${a1}))`;
      }

      // tools cascade into the bag on load (time-driven, all viewports)
      let count = 0;
      for (let i = 0; i < N; i++) {
        const node = toolRefs.current[i];
        if (!node) continue;
        const local = reduce ? 1 : clamp((now - t0 - FILL_HOLD - i * FILL_STAGGER) / FILL_DUR);
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
        pool.current.style.transform = `${jolt}translate(-50%,-50%) translate(0vw, ${(POSE_Y + 16).toFixed(2)}vh) scale(${BAG_S}, ${(BAG_S * 0.5).toFixed(2)})`;
      }
      if (spill.current) {
        spill.current.style.transform = `translate(-50%,-50%) translate(0vw, ${(POSE_Y).toFixed(2)}vh)`;
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
      // the whole performance is a load-time intro: once the entrance, the
      // tool cascade and the dust are done, every frame is identical — stop
      // the loop instead of clearing a full-screen canvas forever.
      const FINISH = FILL_HOLD + N * FILL_STAGGER + FILL_DUR + 600;
      const finished =
        (skipEntrance || (puffed && shakeT0 < 0)) &&
        (reduce || now - t0 > FINISH) &&
        parts.length === 0;
      if (finished) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', sizeDust); };
  }, []);

  const total = TOOLS.slice(0, landed).reduce((s, t) => s + (bagTools.find((b) => b.id === t.id)?.price ?? 0), 0);

  // The bag lives IN the hero: absolute, full-height of the hero, scrolls away
  // with the page. pointer-events-none so it never blocks the content.
  return (
    <div className="absolute inset-x-0 top-0 h-screen z-20 overflow-hidden pointer-events-none select-none" aria-hidden>
      {/* blue light glow under/behind the bag */}
      <div ref={spill} className="absolute left-1/2 top-1/2 will-change-transform" style={{
        width: 'min(90vw, 1300px)', height: 'min(82vh, 1020px)',
        background: 'radial-gradient(42% 42% at 50% 50%, rgba(0,130,202,0.28), transparent 70%)', transform: 'translate(-50%,-50%)' }} />
      {/* soft shadow pool under the bag */}
      <div ref={pool} className="absolute left-1/2 top-1/2 lg:blur-[20px]" style={{
        width: 'min(46vh, 680px)', height: 'min(46vh, 680px)',
        background: 'radial-gradient(ellipse 50% 36% at 50% 50%, rgba(120,170,210,0.16), rgba(120,170,210,0) 64%)',
        transform: 'translate(-50%,-50%)' }} />

      {/* the bag group */}
      <div ref={group} className="absolute left-1/2 top-1/2 will-change-transform w-[75vw] h-auto lg:w-auto lg:h-[min(70vh,980px)]"
        style={{ aspectRatio: String(BAG_AR), transform: 'translate(-50%,-50%)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={bag} src={BAG_BACK} alt="" className="absolute inset-0 h-full w-full object-contain" />

        {TOOLS.map((t, i) => (
          <div key={t.id + '-' + i} ref={(n) => { toolRefs.current[i] = n; }} className="absolute will-change-transform"
            style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.w}%`, height: `${t.w / BAG_AR * 0.62}%`,
              zIndex: 10 + i, opacity: 0, transform: 'translate(-50%,-50%) translateY(-82vh)' }}>
            <div data-shadow className="pointer-events-none absolute left-1/2 -translate-x-1/2"
              style={{ bottom: '-6%', width: '80%', height: '16%', opacity: 0, background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.55), transparent 70%)', filter: 'blur(7px)' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/Images/bag-tools/${t.id}.png`} alt="" draggable={false}
              className="h-full w-full object-contain select-none lg:drop-shadow-[0_14px_22px_rgba(0,0,0,0.5)]" />
          </div>
        ))}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FRONT_PANEL} alt="" className="absolute select-none"
          style={{ left: `${PANEL.left}%`, top: `${PANEL.top}%`, width: `${PANEL.width}%`, zIndex: 40 }} />

        {/* price tag — tallies the tools as they land */}
        <div className="absolute right-[4%] lg:-right-[6%] scale-90 lg:scale-100 origin-bottom-right" style={{ bottom: '20%', zIndex: 50 }}>
          <div className="rounded-2xl px-4 py-2.5 backdrop-blur-xl border border-white/[0.12] text-right"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 12px 30px rgba(0,0,0,0.5), 0 0 28px rgba(0,130,202,0.14)' }}>
            <div className="text-[10px] uppercase tracking-[0.16em] text-fog/90 mb-1">I posen</div>
            <div className="h-display text-white text-2xl leading-none tabular-nums">
              {formatDKK(total)}<span className="text-fog text-xs ml-1">kr</span>
            </div>
            <div className="mt-1.5 text-[11px] tracking-wide">
              <span className="text-stroxx-blue font-semibold tabular-nums">{landed}</span>
              <span className="text-fog/70"> / {TOOLS.length} værktøjer</span>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={dust} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
