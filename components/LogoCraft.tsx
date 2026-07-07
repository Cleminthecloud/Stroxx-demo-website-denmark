import type { CSSProperties } from 'react';
import { X } from 'lucide-react';
import Reveal from '@/components/Reveal';

/** Logo craft: clear space, minimum size, the misuse "never" grid, and dealer
 *  co-branding lockups. Code-owned, part of /brand. Uses the real wordmark
 *  (public/brand/logos/stroxx-white.svg) and the Carl Ras mark; the other three
 *  markets show the typographic lockup rule (no dealer logos in-repo yet). */

const MISUSE: { label: string; imgStyle?: CSSProperties; panel?: string }[] = [
  { label: 'Don’t stretch it', imgStyle: { transform: 'scaleX(1.45)' } },
  { label: 'Don’t squash it', imgStyle: { transform: 'scaleY(0.6)' } },
  { label: 'Don’t tilt it', imgStyle: { transform: 'rotate(7deg)' } },
  { label: 'Don’t add effects', imgStyle: { filter: 'drop-shadow(0 3px 10px rgba(0,136,194,0.9))' } },
  { label: 'Don’t recolour it', imgStyle: { filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(3000%) hue-rotate(345deg)' } },
  { label: 'Don’t kill the contrast', panel: '#C3C7CC' },
];

const LOCKUPS: { market: string; name: string; logo?: string }[] = [
  { market: 'Denmark', name: 'Carl Ras', logo: '/brand/carl-ras-logo-white.svg' },
  { market: 'Germany', name: 'Meesenburg' },
  { market: 'France', name: 'Foussier' },
  { market: 'Belgium', name: 'Lecot' },
];

const panel: CSSProperties = { background: '#0A0B0D', border: '1px solid rgba(255,255,255,0.06)' };

export default function LogoCraft() {
  return (
    <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-10">
      <Reveal><div className="eyebrow mb-6">Logo craft</div></Reveal>

      {/* clear space + minimum size */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Reveal>
          <div className="glass glass-card glass-panel--glow rounded-2xl p-6 h-full">
            <div className="rounded-xl grid place-items-center py-12 mb-5" style={panel}>
              <div className="inline-block" style={{ padding: '18px', border: '1px dashed rgba(0,136,194,0.55)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logos/stroxx-white.svg" alt="STROXX clear space" className="h-14 w-auto block" />
              </div>
            </div>
            <div className="text-white text-sm font-medium">Clear space</div>
            <p className="text-fog text-xs leading-relaxed mt-1">
              {'Keep a margin of at least a third of the logo’s height clear on every side. Nothing, no text, no edge, no other mark, enters the box.'}
            </p>
          </div>
        </Reveal>
        <Reveal delay={90}>
          <div className="glass glass-card glass-panel--glow rounded-2xl p-6 h-full">
            <div className="rounded-xl grid place-items-center py-12 mb-5" style={panel}>
              <div className="flex items-end gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logos/stroxx-white.svg" alt="STROXX minimum size" className="h-[18px] w-auto" />
                <span className="text-fog/50 text-[11px]">24px</span>
              </div>
            </div>
            <div className="text-white text-sm font-medium">Minimum size</div>
            <p className="text-fog text-xs leading-relaxed mt-1">
              {'24px tall on screen, 30mm in print. Below that the frame closes up and it stops being legible, size up or drop the frame.'}
            </p>
          </div>
        </Reveal>
      </div>

      {/* misuse grid */}
      <Reveal><div className="eyebrow mb-5" style={{ color: 'rgba(239,120,120,1)' }}>Never</div></Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {MISUSE.map((m, i) => (
          <Reveal key={m.label} delay={(i % 3) * 70}>
            <div className="glass glass-card rounded-2xl p-5">
              <div className="relative rounded-xl grid place-items-center py-10 mb-3 overflow-hidden" style={{ background: m.panel ?? '#0A0B0D', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="absolute top-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-full" style={{ background: 'rgba(239,60,60,0.9)' }}>
                  <X size={13} strokeWidth={3} color="#fff" />
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/logos/stroxx-white.svg" alt={m.label} className="h-9 w-auto" style={m.imgStyle} />
              </div>
              <div className="text-fog text-xs">{m.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* co-branding */}
      <Reveal><div className="eyebrow mb-4">Co-branding with the dealer</div></Reveal>
      <Reveal>
        <p className="text-fog text-sm leading-relaxed max-w-2xl mb-6">
          {'STROXX leads; the dealer follows, separated by a hairline, with equal clear space around both. The dealer endorses, it never overpowers. Never merge the marks or resize one to dominate.'}
        </p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LOCKUPS.map((d, i) => (
          <Reveal key={d.market} delay={(i % 4) * 70}>
            <div className="glass glass-card glass-panel--glow rounded-2xl p-6">
              <div className="rounded-xl grid place-items-center py-10 mb-4" style={panel}>
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/logos/stroxx-white.svg" alt="STROXX" className="h-6 w-auto" />
                  <span className="block w-px h-7 bg-line" aria-hidden />
                  {d.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.logo} alt={d.name} className="h-6 w-auto opacity-90" />
                  ) : (
                    <span className="text-white text-sm tracking-wide">{d.name}</span>
                  )}
                </div>
              </div>
              <div className="text-white text-sm">{d.name}</div>
              <div className="text-fog text-xs">{d.market}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
