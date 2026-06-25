'use client';

/* ──────────────────────────────────────────────────────────────────────────
   SiteOverlay — a placeholder / "work in progress" notice that greets every
   visitor while the site and brand platform are still being built.

   For fun it borrows the Mission: Impossible self-destruct trope: a 15:00
   countdown with a burning fuse. When the timer hits zero the screen does a
   playful "BOOM" glitch and then everything resets and counts down again.
   Nothing actually self-destructs.

   Behaviour: shows on every fresh page load (no persistence), is always
   dismissible, and after dismissal leaves a small live countdown badge in the
   corner that re-opens the notice on click.
   ────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react';

const TOTAL = 15 * 60; // 15 minutes, in seconds
const BLUE = '#0082CA';

const mmss = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

// Global flag the homepage hero (BagJourney) reads so it can hold its bag-fill
// intro until this overlay is dismissed, then play it on a clear screen. Set
// true at module load so it is ready before any component effect runs.
type OverlayWindow = Window & { __stroxxOverlayOpen?: boolean };
if (typeof window !== 'undefined') (window as OverlayWindow).__stroxxOverlayOpen = true;

export default function SiteOverlay() {
  const [open, setOpen] = useState(true);
  const [remaining, setRemaining] = useState(TOTAL);
  const [boom, setBoom] = useState(false);
  const startRef = useRef<number>(Date.now());

  // Single ticking clock that runs whether or not the overlay is open, so the
  // corner badge keeps counting too.
  useEffect(() => {
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = TOTAL - elapsed;
      if (left <= 0) {
        // reached zero: flash the glitch, then reset and keep going
        setBoom(true);
        setRemaining(0);
        startRef.current = Date.now() + 1800; // hold at 0 during the ~1.8s boom
        setTimeout(() => setBoom(false), 1800);
      } else {
        setRemaining(left);
      }
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, []);

  const pct = Math.max(0, Math.min(100, (remaining / TOTAL) * 100));

  // Dismiss: tell the homepage hero it can now play its bag-fill intro.
  const dismiss = () => {
    (window as OverlayWindow).__stroxxOverlayOpen = false;
    window.dispatchEvent(new Event('stroxx:reveal'));
    setOpen(false);
  };
  const reopen = () => {
    (window as OverlayWindow).__stroxxOverlayOpen = true;
    setOpen(true);
  };

  return (
    <>
      <style>{`
        @keyframes ovl-spark { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.5); opacity: .7 } }
        @keyframes ovl-fly { 0% { transform: translate(0,0) scale(1); opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0 } }
        @keyframes ovl-glitch { 0%,100% { transform: translate(0,0) } 20% { transform: translate(-4px,2px) } 40% { transform: translate(3px,-3px) } 60% { transform: translate(-3px,-2px) } 80% { transform: translate(4px,3px) } }
        @keyframes ovl-scan { from { background-position: 0 0 } to { background-position: 0 6px } }
        @keyframes ovl-in { from { opacity: 0; transform: translateY(10px) scale(.98) } to { opacity: 1; transform: none } }
        @keyframes ovl-pulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
      `}</style>

      {/* ── corner badge (visible once the notice is dismissed) ── */}
      {!open && (
        <button
          onClick={reopen}
          aria-label="Reopen the placeholder notice"
          style={{
            position: 'fixed', left: 16, bottom: 16, zIndex: 2147483000,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 999,
            background: 'rgba(10,11,13,0.82)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.12)', color: '#fff',
            font: '600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace',
            letterSpacing: '0.06em', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <span style={{ fontSize: 13 }}>💣</span>
          <span style={{ color: boom ? '#ff3b30' : BLUE }}>{boom ? 'BOOM' : mmss(remaining)}</span>
        </button>
      )}

      {/* ── full-screen notice ── */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site under construction"
          style={{
            position: 'fixed', inset: 0, zIndex: 2147483600,
            display: 'grid', placeItems: 'center', padding: 20,
            background: 'radial-gradient(120% 80% at 50% -10%, rgba(0,130,202,0.18), transparent 60%), rgba(6,7,9,0.86)',
            backdropFilter: 'blur(8px)',
            animation: boom ? 'ovl-glitch 0.18s steps(2) infinite' : undefined,
          }}
        >
          {/* CRT scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
            background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)',
            animation: 'ovl-scan 0.5s linear infinite',
          }} />

          <div style={{
            position: 'relative', width: 'min(560px, 100%)',
            background: 'linear-gradient(180deg, rgba(20,22,26,0.96), rgba(12,13,16,0.96))',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20,
            padding: '34px 30px 28px', color: '#fff', textAlign: 'center',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            animation: 'ovl-in 0.5s cubic-bezier(.16,1,.3,1) both',
          }}>
            <div style={{
              font: '600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace',
              letterSpacing: '0.32em', color: BLUE, textTransform: 'uppercase', marginBottom: 16,
            }}>
              STROXX · Top secret
            </div>

            {boom ? (
              <div style={{
                font: '800 clamp(2.6rem,9vw,4.4rem)/1 ui-monospace, Menlo, monospace',
                color: '#ff3b30', letterSpacing: '0.04em', margin: '10px 0 6px',
                textShadow: '0 0 24px rgba(255,59,48,0.7)',
              }}>
                💥 BOOM 💥
              </div>
            ) : (
              <h2 style={{
                font: '800 clamp(1.5rem,4.4vw,2.1rem)/1.1 system-ui, sans-serif',
                margin: '0 0 12px', letterSpacing: '-0.01em',
              }}>
                This site is still under construction
              </h2>
            )}

            <p style={{
              margin: '0 auto 6px', maxWidth: 420, color: 'rgba(255,255,255,0.72)',
              font: '400 15px/1.55 system-ui, sans-serif',
            }}>
              Everything you see here is placeholder content while we build the
              site and shape the brand platform. The copy and products are not
              final, so please do not take any of it as gospel just yet.
            </p>

            {/* mission-impossible self-destruct */}
            <div style={{ margin: '22px 0 6px' }}>
              <div style={{
                font: '600 11px/1 ui-monospace, Menlo, monospace', letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 10,
              }}>
                This message will self-destruct in
              </div>
              <div style={{
                font: '800 clamp(2.4rem,11vw,3.6rem)/1 ui-monospace, Menlo, monospace',
                color: boom ? '#ff3b30' : '#fff', letterSpacing: '0.06em',
                textShadow: boom ? '0 0 22px rgba(255,59,48,0.7)' : `0 0 22px rgba(0,130,202,0.4)`,
                animation: 'ovl-pulse 1s ease-in-out infinite',
              }}>
                {mmss(remaining)}
              </div>

              {/* burning fuse */}
              <div style={{
                position: 'relative', height: 34, margin: '14px 6px 0',
                display: 'flex', alignItems: 'center',
              }}>
                <span style={{ fontSize: 22, lineHeight: 1, marginRight: 2, zIndex: 2 }}>💣</span>
                {/* fuse track */}
                <div style={{ position: 'relative', flex: 1, height: 8 }}>
                  {/* charred (already burned) base line */}
                  <div style={{
                    position: 'absolute', inset: '50% 0 auto 0', height: 4, transform: 'translateY(-50%)',
                    borderRadius: 4, background: 'rgba(255,255,255,0.10)',
                  }} />
                  {/* remaining fuse cord */}
                  <div style={{
                    position: 'absolute', top: '50%', left: 0, height: 5, width: `${pct}%`,
                    transform: 'translateY(-50%)', borderRadius: 4,
                    background: 'repeating-linear-gradient(90deg, #b8862f 0 4px, #7a5418 4px 8px)',
                    transition: 'width 0.25s linear',
                  }} />
                  {/* burning spark at the tip of the remaining cord */}
                  {!boom && (
                    <div style={{
                      position: 'absolute', top: '50%', left: `${pct}%`,
                      transform: 'translate(-50%,-50%)', width: 16, height: 16,
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'radial-gradient(circle, #fff 0%, #ffd84d 35%, #ff7a00 70%, rgba(255,122,0,0) 100%)',
                        animation: 'ovl-spark 0.35s ease-in-out infinite',
                        boxShadow: '0 0 12px 4px rgba(255,140,0,0.7)',
                      }} />
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} style={{
                          position: 'absolute', top: '50%', left: '50%', width: 3, height: 3,
                          borderRadius: '50%', background: '#ffd24d',
                          ['--dx' as string]: `${[-10, 8, -6, 9][i]}px`,
                          ['--dy' as string]: `${[-9, -7, 8, 6][i]}px`,
                          animation: `ovl-fly ${0.6 + i * 0.12}s linear infinite`,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={dismiss}
              style={{
                marginTop: 22, width: '100%', padding: '13px 18px', borderRadius: 12,
                border: 'none', cursor: 'pointer',
                background: BLUE, color: '#fff',
                font: '700 14px/1 system-ui, sans-serif', letterSpacing: '0.02em',
                boxShadow: '0 10px 26px rgba(0,130,202,0.35)',
              }}
            >
              Got it, take me in
            </button>
            <div style={{
              marginTop: 12, font: '400 11px/1.4 ui-monospace, Menlo, monospace',
              color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em',
            }}>
              Relax, nothing actually explodes.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
