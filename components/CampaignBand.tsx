'use client';
import { useEffect, useRef, useState } from 'react';
import GlassButton from '@/components/GlassButton';
import { ArrowRight } from 'lucide-react';
import { CR_BRAND, UTM } from '@/lib/data';

/** Full-bleed cinematic campaign band — the print campaign as motion: three B&W
 *  lifestyle shots cross-fade with a slow Ken Burns drift while the headline /
 *  body stay pinned on a dark left scrim. Auto-advances, pauses on hover, and
 *  falls back to a single still for reduced-motion. */
const SLIDES = [
  { src: '/Images/campaign/rings.jpg', sm: '/Images/campaign/rings-sm.jpg', pos: '60% 40%', alt: 'Håndværker med ringe og hammer' },
  { src: '/Images/campaign/tea.jpg', sm: '/Images/campaign/tea-sm.jpg', pos: '68% 50%', alt: 'Håndværker i smækbukser drikker af fint porcelæn' },
  { src: '/Images/campaign/glasses.jpg', sm: '/Images/campaign/glasses-sm.jpg', pos: '72% 50%', alt: 'Smilende håndværker med bling-solbriller og vinkelsliber' },
];
const DWELL = 5200; // ms per slide

export default function CampaignBand() {
  const [i, setI] = useState(0);
  const [reduce, setReduce] = useState(false);
  const paused = useRef(false);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(m.matches);
    if (m.matches) return;
    const id = setInterval(() => {
      if (!paused.current) setI((p) => (p + 1) % SLIDES.length);
    }, DWELL);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative z-[46] w-full overflow-hidden bg-ink"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      aria-label="STROXX-kampagne"
    >
      {/* carry the photos' real 16:9 ratio so the full frame shows (no head-crop);
          min-height keeps it substantial on short/!mobile, where it covers-crops */}
      <div className="relative w-full aspect-[16/9] min-h-[72vh] max-h-[112vh]">
        {/* image series */}
        {SLIDES.map((s, idx) => {
          const active = idx === i;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.src}
              src={s.src}
              srcSet={`${s.sm} 1280w, ${s.src} 2200w`}
              sizes="100vw"
              alt={s.alt}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover select-none grayscale"
              style={{
                objectPosition: s.pos,
                opacity: active ? 1 : 0,
                // start at 1.0 so the full frame is visible as it fades in, then a
                // gentle drift — keeps the head in shot while still feeling alive.
                transform: reduce ? 'none' : `scale(${active ? 1.06 : 1.0})`,
                transition: reduce
                  ? 'opacity 1.2s ease'
                  : 'opacity 1.5s ease, transform 6.8s ease-out',
                willChange: 'opacity, transform',
              }}
            />
          );
        })}

        {/* scrims: dark left for text, soft top/bottom to melt into the page */}
        <div className="pointer-events-none absolute inset-0" style={{
          background:
            'linear-gradient(90deg, rgba(8,9,11,0.94) 0%, rgba(8,9,11,0.72) 30%, rgba(8,9,11,0.28) 58%, rgba(8,9,11,0) 80%)',
        }} />
        <div className="pointer-events-none absolute inset-0" style={{
          background:
            'linear-gradient(180deg, #0B0C0E 0%, rgba(11,12,14,0) 14%, rgba(11,12,14,0) 78%, #0B0C0E 100%)',
        }} />

        {/* text */}
        <div className="relative h-full mx-auto max-w-[1600px] px-6 md:px-10 flex items-center">
          <div className="max-w-xl">
            <div className="eyebrow mb-5">Kampagne</div>
            <h2 className="h-display text-white text-[clamp(2.3rem,5.6vw,4.8rem)] leading-[0.95] mb-7">
              Få råd til andet<br className="hidden sm:block" /> end værktøj
            </h2>
            <p className="text-fog text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              STROXX er fuldstændigt ligesom dit dyre værktøj og gode gear. Det koster bare
              ikke nær så meget. Og hvis du synes det lyder for godt til at være sandt, så
              siger vi bare:{' '}
              <span className="text-stroxx-blue font-semibold tracking-wide">PRØV DET.</span>{' '}
              Er det ikke lige dig, eller er du ikke tilfreds, så får du pengene tilbage.
              Simpelthen.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <GlassButton href={`${CR_BRAND}/?${UTM}`} external>
                Køb hos Carl Ras <ArrowRight size={16} />
              </GlassButton>
            </div>

            {/* progress indicator */}
            <div className="mt-10 flex gap-2.5" role="tablist" aria-label="Vælg kampagnebillede">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.src}
                  type="button"
                  role="tab"
                  aria-selected={idx === i}
                  aria-label={`Billede ${idx + 1}`}
                  onClick={() => setI(idx)}
                  className="group relative h-1 w-12 rounded-full bg-white/15 overflow-hidden cursor-pointer"
                >
                  <span
                    className="absolute inset-0 origin-left rounded-full bg-stroxx-blue"
                    style={{
                      transform: `scaleX(${idx === i ? 1 : 0})`,
                      transition: idx === i && !reduce ? `transform ${DWELL}ms linear` : 'transform .3s ease',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
