'use client';
import { useEffect, useRef, useState } from 'react';

/* ──────────────────────────────────────────────────────────────────────────
   Masked-reveal "fill the bag" rig (prototype).

   Layers, back → front:
     1. bag back  (full bag PNG)
     2. tools     (drop in on scroll, each into a rest slot)
     3. bag front (the SAME bag PNG, clipped to its lower front wall, drawn on
        top of the tools so they sink BEHIND the front lip — the occlusion that
        sells "inside the bag")

   Everything is tuned by the TOOLS array + the LIP constant below, so dialing
   in positions after seeing it on screen is a one-place edit. When the proper
   two-layer bag art arrives, swap BAG_BACK/BAG_FRONT and drop the clip.
   ────────────────────────────────────────────────────────────────────────── */

// Exported so the homepage BagJourney reuses the exact same tuned geometry.
export const BAG_BACK = '/Images/Bag-test/bag_use.png';
export const BAG_AR = 1024 / 1536; // width / height of the PNG canvas

// The front wall occluder: a DEDICATED front-panel cut-out (just the front wall
// with the STROXX label + pockets), laid opaquely on top of the tools so their
// lower halves are hidden. Positioned over the bag's own front wall — nudge
// these % so it sits exactly on top of the back layer's front wall.
export const FRONT_PANEL = '/Images/Bag-test/newfront_trythis.png';
// Computed so the panel's STROXX badge lands exactly on the back bag's badge at
// matching scale (measured badge centroids: bag 60.7%,53.5% — panel 55%,25.2%;
// badge widths gave the 75% panel width). height auto keeps aspect.
export const PANEL = { left: 19, top: 45, width: 75 }; // % of stage

// each tool: id (from bagTools), x/y rest centre (% of stage), w (% of stage
// width), rotation (deg). Order = drop order = depth (later drops in front).
export type Slot = { id: number; x: number; y: number; w: number; rot: number };
// Dark / clean-knockout tools only. `w` is sized to the tools' REAL relative
// dimensions (longest side): torpedo level 250mm is the biggest, the 165mm saw
// blade much smaller, the cross-laser smallest. (Estimated — the saw blade fills
// its photo tightly so it needs a smaller box than its real size suggests.)
export const TOOLS: Slot[] = [
  { id: 124546, x: 44, y: 38, w: 18, rot: -11 }, // Rundsavklinge Z30 (165mm) — back left
  { id: 159146, x: 53, y: 39, w: 23, rot: -3 },  // Krydslaser (~115mm) — back centre
  { id: 171900, x: 65, y: 41, w: 18, rot: 6 },   // Rundsavklinge Z48 (165mm) — back right
  { id: 134353, x: 32, y: 44, w: 40, rot: 7 },   // Torpedo vaterpas (250mm) — wide, left
  { id: 53081, x: 61, y: 46, w: 21, rot: -9 },   // Multitool (~150mm) — right
  { id: 161224, x: 28, y: 48, w: 16, rot: 12 },  // Speed vinkel (~185mm) — front left (fills photo → smaller box)
  { id: 53080, x: 49, y: 51, w: 17, rot: -15 },  // Kniv 18mm (~140mm) — front centre
  { id: 53078, x: 71, y: 49, w: 22, rot: 16 },   // Kniv 25mm (~165mm) — front right
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutBack = (t: number) => {
  const c1 = 1.5, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export default function BagFill() {
  const wrap = useRef<HTMLDivElement>(null);
  const toolRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [landed, setLanded] = useState(0);
  // Safari (iOS and macOS) rasterises large drop-shadow layers as opaque
  // white when they exceed GPU memory; skip the filter there.
  const [noShadow, setNoShadow] = useState(false);

  useEffect(() => {
    if (/safari/i.test(navigator.userAgent) && !/chrome|chromium|crios|edg|android/i.test(navigator.userAgent)) {
      setNoShadow(true);
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    const N = TOOLS.length;
    const loop = () => {
      const el = wrap.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const p = total > 0 ? clamp(-rect.top / total) : 0;

        let count = 0;
        for (let i = 0; i < N; i++) {
          const node = toolRefs.current[i];
          if (!node) continue;
          const start = (i / N) * 0.62;        // stagger the drops
          const local = clamp((p - start) / 0.34);
          const e = local <= 0 ? 0 : easeOutBack(local);
          const fall = (1 - e) * 78;            // vh above rest → 0 on land
          // only a slight blur while falling; fully sharp well before it lands
          const blur = (1 - clamp(local / 0.6)) * 3;
          const wobble = Math.sin(local * Math.PI) * (1 - local) * 4; // settle sway
          node.style.opacity = local > 0 ? '1' : '0';
          node.style.transform =
            `translate(-50%,-50%) translateY(${-fall}vh) rotate(${TOOLS[i].rot + wobble}deg)`;
          node.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : 'none';
          const sh = node.querySelector('[data-shadow]') as HTMLElement | null;
          if (sh) sh.style.opacity = String(clamp((local - 0.4) / 0.6) * 0.5);
          if (local > 0.5) count++;
        }
        setLanded((prev) => (prev === count ? prev : count));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={wrap} className="relative" style={{ height: '360vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* soft blue light pool behind the bag */}
        <div className="pointer-events-none absolute" style={{
          width: '70vw', height: '70vh',
          background: 'radial-gradient(42% 42% at 50% 52%, rgba(0,130,202,0.22), transparent 70%)',
        }} />

        {/* the bag stage */}
        <div className="relative" style={{ height: '82vh', aspectRatio: String(BAG_AR) }}>
          {/* contact shadow under the whole bag */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2"
            style={{ bottom: '14%', width: '64%', height: '7%', background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.6), transparent 70%)', filter: 'blur(14px)' }} />

          {/* 1 — bag back */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BAG_BACK} alt="" className="absolute inset-0 h-full w-full object-contain select-none"
            style={noShadow ? undefined : { filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.55))' }} />

          {/* 2 — tools */}
          {TOOLS.map((t, i) => (
            <div
              key={t.id + '-' + i}
              ref={(n) => { toolRefs.current[i] = n; }}
              className="absolute will-change-transform"
              style={{
                left: `${t.x}%`, top: `${t.y}%`, width: `${t.w}%`,
                height: `${t.w / BAG_AR * 0.62}%`,
                zIndex: 10 + i, opacity: 0,
                transform: 'translate(-50%,-50%) translateY(-78vh)',
              }}
            >
              {/* per-tool drop shadow (fades in on land) */}
              <div data-shadow className="pointer-events-none absolute left-1/2 -translate-x-1/2"
                style={{ bottom: '-6%', width: '80%', height: '16%', opacity: 0, background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.55), transparent 70%)', filter: 'blur(7px)' }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/Images/bag-tools/${t.id}.png`} alt="" draggable={false}
                className="h-full w-full object-contain select-none lg:drop-shadow-[0_14px_22px_rgba(0,0,0,0.5)]" />
            </div>
          ))}

          {/* 3 — bag front lip (same image, only the lower front wall shows) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FRONT_PANEL} alt="" aria-hidden
            className="absolute select-none"
            style={{ left: `${PANEL.left}%`, top: `${PANEL.top}%`, width: `${PANEL.width}%`, zIndex: 40 }} />

          {/* count chip, compact glass tag, anchored to the bag so it travels
              with it; the tool count ticks up as tools land */}
          <div className="absolute" style={{ right: '-3%', bottom: '22%', zIndex: 50 }}>
            <div className="rounded-2xl px-4 py-2.5 backdrop-blur-xl border border-white/[0.12] text-right"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 12px 30px rgba(0,0,0,0.5), 0 0 28px rgba(0,130,202,0.14)',
              }}>
              <div className="text-[9px] uppercase tracking-[0.18em] text-fog mb-1">In the bag</div>
              <div className="h-display text-white text-xl leading-none tabular-nums">
                {landed}<span className="text-fog text-[11px] ml-1 align-baseline">/ {TOOLS.length}</span>
              </div>
              <div className="mt-1.5 text-[10px] tracking-wide">
                <span className="text-fog/60">tools loaded</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
