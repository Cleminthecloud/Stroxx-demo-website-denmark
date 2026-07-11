'use client';
import { useDealerChooser } from '@/components/DealerChooser';
import { dealerBuyUrl } from '@/lib/buy';
import { useEffect, useRef, useState } from 'react';
import GlassButton from '@/components/GlassButton';
import Accent from '@/components/Accent';
import { ArrowRight } from 'lucide-react';

type CampaignBandProps = {
  images?: string[];
  eyebrow?: string;
  headline?: string;
  text?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  href?: string; // resolved "read more" target (campaign landing page or /try-it)
  // click-to-edit targets (Presentation) — data-sanity strings from the homepage
  eyebrowAttr?: string;
  headlineAttr?: string;
  textAttr?: string;
  primaryAttr?: string;
  secondaryAttr?: string;
};

/** Full-bleed cinematic campaign band — the print campaign as motion: three B&W
 *  lifestyle shots cross-fade with a slow Ken Burns drift while the headline /
 *  body stay pinned on a dark left scrim. Auto-advances, pauses on hover, and
 *  falls back to a single still for reduced-motion. */
const SLIDES = [
  { src: '/Images/campaign/rings.jpg', sm: '/Images/campaign/rings-sm.jpg', pos: '60% 40%', alt: 'Tradesperson with rings and a hammer' },
  { src: '/Images/campaign/tea.jpg', sm: '/Images/campaign/tea-sm.jpg', pos: '68% 50%', alt: 'Tradesperson in bib overalls drinking from fine porcelain' },
  { src: '/Images/campaign/glasses.jpg', sm: '/Images/campaign/glasses-sm.jpg', pos: '72% 50%', alt: 'Smiling tradesperson with bling sunglasses and an angle grinder' },
];
const DWELL = 3400; // ms per slide

export default function CampaignBand({
  images,
  eyebrow = 'Campaign',
  headline = 'Now you can afford\nmore than just tools',
  text = 'STROXX is exactly like your pricey tools and good gear. It just does not cost nearly as much. And if you think that sounds too good to be true, we simply say: *TRY IT.* Not for you, or not happy? You get your money back. Simple as that.',
  primaryLabel,
  secondaryLabel = 'Read more',
  href = '/try-it',
  eyebrowAttr,
  headlineAttr,
  textAttr,
  primaryAttr,
  secondaryAttr,
}: CampaignBandProps) {
  const { currentDealer, open: openChooser } = useDealerChooser();
  /* Null when there is no market dealer URL (international, or a dealer market
     missing its Buy-at CTA link) → show the chooser, never another market's shop. */
  const dealerUrl = dealerBuyUrl(currentDealer);
  // CMS uploads when present, the built-in campaign shots otherwise
  const slides = images && images.length
    ? images.map((src, n) => ({ src, sm: undefined as string | undefined, pos: '60% 40%', alt: `STROXX campaign photo ${n + 1}` }))
    : SLIDES;
  const [i, setI] = useState(0);
  const [reduce, setReduce] = useState(false);
  const paused = useRef(false);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(m.matches);
    if (m.matches) return;
    const id = setInterval(() => {
      if (!paused.current) setI((p) => (p + 1) % slides.length);
    }, DWELL);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section
      className="relative z-[46] w-full overflow-hidden bg-ink"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      aria-label="STROXX campaign"
    >
      {/* carry the photos' real 16:9 ratio so the full frame shows (no head-crop);
          min-height keeps it substantial on short/!mobile, where it covers-crops */}
      {/* phones: a full-screen poster (image covers, copy bottom-left on the
          scrim); desktop: the photos' real 16:9 ratio so the full frame shows */}
      <div className="relative w-full h-[92svh] lg:h-auto lg:aspect-[16/9] lg:min-h-[72vh] lg:max-h-[112vh]">
        {/* image series */}
        {slides.map((s, idx) => {
          const active = idx === i;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.src}
              src={s.src}
              srcSet={`${s.sm} 1280w, ${s.src} 2200w`}
              sizes="100vw"
              alt={s.alt}
              // slide 1 paints the band; 2 and 3 can arrive when the rotation needs them
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover select-none grayscale"
              style={{
                objectPosition: s.pos,
                opacity: active ? 1 : 0,
                // start at 1.0 so the full frame is visible as it fades in, then a
                // gentle drift — keeps the head in shot while still feeling alive.
                transform: reduce ? 'none' : `scale(${active ? 1.06 : 1.0})`,
                transition: reduce
                  ? 'opacity 0.9s ease'
                  : 'opacity 0.9s ease, transform 4.6s ease-out',
                willChange: 'opacity, transform',
              }}
            />
          );
        })}

        {/* scrims: dark left for text (desktop), soft top/bottom to melt into the
            page. On phones the text sits bottom-left, so the strong scrim is a
            bottom gradient instead of a left one. */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block" style={{
          background:
            'linear-gradient(90deg, rgba(8,9,11,0.94) 0%, rgba(8,9,11,0.72) 30%, rgba(8,9,11,0.28) 58%, rgba(8,9,11,0) 80%)',
        }} />
        <div className="pointer-events-none absolute inset-0 lg:hidden" style={{
          background:
            'linear-gradient(180deg, rgba(8,9,11,0.3) 0%, rgba(8,9,11,0) 30%, rgba(8,9,11,0.45) 55%, rgba(8,9,11,0.96) 100%)',
        }} />
        <div className="pointer-events-none absolute inset-0" style={{
          background:
            'linear-gradient(180deg, #0B0C0E 0%, rgba(11,12,14,0) 14%, rgba(11,12,14,0) 78%, #0B0C0E 100%)',
        }} />

        {/* text — bottom-left on phones, centered-left on desktop */}
        <div className="relative h-full mx-auto max-w-[1600px] px-6 md:px-10 flex items-end pb-12 lg:items-center lg:pb-0">
          <div className="max-w-xl">
            <div className="eyebrow mb-5" data-sanity={eyebrowAttr}>{eyebrow}</div>
            <h2 data-sanity={headlineAttr} className="h-display text-white text-[clamp(2.1rem,5.6vw,4.8rem)] leading-[0.95] mb-4 md:mb-7">
              <Accent text={headline} />
            </h2>
            <p data-sanity={textAttr} className="text-fog text-sm md:text-lg leading-relaxed mb-6 md:mb-8 max-w-lg">
              <Accent text={text} />
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* label: CMS override per locale doc, else automatic. The English
                  base doc stays dealer-neutral (it renders internationally). */}
              {currentDealer && dealerUrl ? (
                <GlassButton href={dealerUrl} external>
                  <span data-sanity={primaryAttr}>{primaryLabel || `Buy at ${currentDealer.dealerName}`}</span> <ArrowRight size={16} />
                </GlassButton>
              ) : (
                <GlassButton onClick={openChooser}><span data-sanity={primaryAttr}>{primaryLabel || 'Where to buy'}</span> <ArrowRight size={16} /></GlassButton>
              )}
              <GlassButton href={href} variant="ghost">
                <span data-sanity={secondaryAttr}>{secondaryLabel}</span>
              </GlassButton>
            </div>

            {/* progress indicator */}
            <div className="mt-7 md:mt-10 flex gap-2.5" role="tablist" aria-label="Choose campaign image">
              {slides.map((s, idx) => (
                <button
                  key={s.src}
                  type="button"
                  role="tab"
                  aria-selected={idx === i}
                  aria-label={`Image ${idx + 1}`}
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
