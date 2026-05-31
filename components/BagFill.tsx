'use client';
import { useEffect, useRef, useState } from 'react';
import KnockoutImage from '@/components/KnockoutImage';
import { bagTools, toolTexture, formatDKK } from '@/lib/data';

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

const BAG_BACK = '/Images/Bag-test/bag_use.png';
const BAG_FRONT = '/Images/Bag-test/bag_use.png'; // same image, clipped to front wall
const BAG_AR = 1024 / 1536; // width / height of the PNG canvas

// y (% of stage height) of the front-lip top edge. Tools below this are hidden
// behind the front wall. ~46% matches where the bag's front face begins.
const LIP = 46;

// each tool: id (from bagTools), x/y rest centre (% of stage), w (% of stage
// width), rotation (deg). Order = drop order = depth (later drops in front).
type Slot = { id: number; x: number; y: number; w: number; rot: number };
const TOOLS: Slot[] = [
  { id: 159146, x: 50, y: 35, w: 30, rot: -3 }, // Krydslaser — back centre
  { id: 171900, x: 62, y: 37, w: 27, rot: 5 },  // Rundsavklinge — back right
  { id: 134353, x: 34, y: 42, w: 40, rot: 7 },  // Torpedo vaterpas — wide, left
  { id: 53081, x: 64, y: 41, w: 25, rot: -9 },  // Multitool — right
  { id: 161224, x: 27, y: 45, w: 29, rot: 13 }, // Speed vinkel — front left
  { id: 159147, x: 48, y: 46, w: 22, rot: -6 }, // Afstandsmåler — front centre
  { id: 53078, x: 70, y: 47, w: 19, rot: 17 },  // Kniv — front right
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
          const blur = (1 - clamp(local / 0.85)) * 7; // motion blur while falling
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

  const total = TOOLS.slice(0, landed).reduce((s, t) => {
    const bt = bagTools.find((b) => b.id === t.id);
    return s + (bt?.price ?? 0);
  }, 0);

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
            style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.55))' }} />

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
              <KnockoutImage src={toolTexture(t.id)} alt="" maxSize={520} className="h-full w-full" />
            </div>
          ))}

          {/* 3 — bag front lip (same image, only the lower front wall shows) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BAG_FRONT} alt="" aria-hidden
            className="absolute inset-0 h-full w-full object-contain select-none"
            style={{ zIndex: 40, clipPath: `inset(${LIP}% 0 0 0)` }} />
        </div>

        {/* price counter overlay */}
        <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 text-center" style={{ zIndex: 50 }}>
          <div className="eyebrow mb-2">Fyld posen</div>
          <div className="h-display text-white text-[clamp(2rem,5vw,3.6rem)] leading-none">
            {formatDKK(total)} <span className="text-fog text-base align-top">DKK</span>
          </div>
          <div className="text-fog text-sm mt-2">{landed} af {TOOLS.length} værktøjer</div>
        </div>
      </div>
    </section>
  );
}
