import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import BrandGuide from '@/components/BrandGuide';
import LogoMotion from '@/components/LogoMotion';
import PhotoGallery from '@/components/PhotoGallery';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Brand guide',
  robots: { index: false, follow: false },
};

/** The brand hub, one shared, code-owned page for every market (DK / DE / FR /
 *  BE): the STROXX 3.0 story to rally the brand team and the dealers, the logo
 *  and its download pack, an animated motion kit, the palette / type / motion
 *  rules, positioning and voice. Grounded in the 2024 brandbook and the 2026
 *  Brand Plan (INFO/). Managed by us, not the CMS. The full playbook stays
 *  internal (INFO/), not on the site. */

type Fmt = [label: string, href: string];

const LOGO_SETS: { name: string; note: string; src: string; dark: boolean; web: Fmt[]; print: Fmt[] }[] = [
  {
    name: 'White logo',
    note: 'The default. For black and very dark backgrounds.',
    src: '/brand/logos/stroxx-white.svg',
    dark: true,
    web: [['SVG', '/brand/logos/stroxx-white.svg'], ['PNG', '/brand/logos/stroxx-white.png'], ['WebP', '/brand/logos/stroxx-white.webp']],
    print: [['PDF', '/brand/logos/stroxx-white.pdf'], ['EPS', '/brand/logos/stroxx-white.eps'], ['AI', '/brand/logos/stroxx-white.ai']],
  },
  {
    name: 'Black logo',
    note: 'For light or very pale backgrounds only.',
    src: '/brand/logos/stroxx-black.svg',
    dark: false,
    web: [['SVG', '/brand/logos/stroxx-black.svg'], ['PNG', '/brand/logos/stroxx-black.png'], ['WebP', '/brand/logos/stroxx-black.webp']],
    print: [['PDF', '/brand/logos/stroxx-black.pdf'], ['EPS', '/brand/logos/stroxx-black.eps'], ['AI', '/brand/logos/stroxx-black.ai']],
  },
];

/** The markets and their dealers. If we name one, we name them all. */
const DEALERS = [
  { market: 'Denmark', name: 'Carl Ras' },
  { market: 'Germany', name: 'Meesenburg' },
  { market: 'France', name: 'Foussier' },
  { market: 'Belgium', name: 'Lecot' },
];

/** The three moves from the STROXX 3.0 thinking (INFO/Bit more info). */
const PRINCIPLES = [
  { t: 'Act like the leader', b: 'Not the challenger apologising for the price. Show up with the confidence of the category benchmark.' },
  { t: 'Look and act premium', b: 'Premium tools. The craft, the detail, the black-and-blue restraint. The quality has to be felt before it is explained.' },
  { t: 'Price is the positive surprise', b: 'Unpremium prices, but never the opening line. Earn trust first; let the price land as the reward, not the reason.' },
];

const DOS = [
  'Keep clear space around the logo, at least a third of its height, on every side.',
  'Place the logo on black, or on a very dark, almost-black image.',
  'Lead with blue as the only accent; let black and white carry the rest.',
  'Sell with proof: quality, specifics, the trade. Let the work do the talking.',
];
const DONTS = [
  'Stretch, squash, rotate, recolour or add effects to the logo.',
  'Put the logo on a busy or light background where it loses contrast.',
  'Reach for the extended palette (green, red, pink, yellow) without STROXX marketing.',
  'Open with price, or talk price on the brand side. That is the dealers’ job.',
];

/** Brand imagery. Drop new files into /public/brand/gallery and add a row. */
const GALLERY = [
  { src: '/brand/gallery/workshop-cabinet.jpg', label: 'Workshop cabinet' },
  { src: '/brand/gallery/tool-bag.jpg', label: 'Tool bag' },
];

/** Campaign photography, the Prøv Det (Try It) heroes: "Now you can afford
 *  more than just tools". Black and white, the brand's photographic language. */
const CAMPAIGN = [
  { src: '/Images/campaign/tea.jpg', label: 'Afford more than just tools · Tea' },
  { src: '/Images/campaign/glasses.jpg', label: 'Afford more than just tools · Glasses' },
  { src: '/Images/campaign/rings.jpg', label: 'Afford more than just tools · Rings' },
];

function FmtLink({ f }: { f: Fmt }) {
  return (
    <a
      href={f[1]}
      download
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink/50 px-3.5 py-1.5 text-xs text-fog transition-colors hover:border-stroxx-blue/50 hover:text-white"
    >
      <Download size={12} strokeWidth={2} /> {f[0]}
    </a>
  );
}

export default function BrandPage() {
  return (
    <main className="bg-ink min-h-screen">
      {/* HERO */}
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-32 md:pt-40 pb-8">
        <Reveal>
          <div className="eyebrow mb-6">Internal · Brand</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logos/stroxx-white.svg" alt="STROXX" className="h-12 md:h-16 w-auto mb-10" />
          <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95] max-w-3xl">
            Premium tools. <span className="text-stroxx-blue">Unpremium prices.</span>
          </h1>
          <p className="mt-6 text-fog text-lg leading-relaxed max-w-2xl">
            {'Black, bold, and built to blend in, so your work can stand out. This is the shared brand hub for every market: the story, the logo, the motion, the rules and the voice. Take what you need, and let’s build STROXX 3.0 together.'}
          </p>
        </Reveal>
      </div>

      {/* STROXX 3.0 — the rallying story for team + dealers */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-10">
        <Reveal><div className="eyebrow mb-6">Welcome to STROXX 3.0</div></Reveal>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <Reveal>
            <div className="space-y-5 text-fog leading-relaxed max-w-2xl">
              <p>{'Over the past years STROXX has grown across markets, categories and partnerships. That growth created real opportunity, and some complexity. Now is the moment to sharpen, simplify and strengthen the foundation.'}</p>
              <p>{'We are cleaning up the brand, not only visually but strategically: removing what dilutes clarity and focusing on what truly defines STROXX. Quality that makes sense. A strong, reliable alternative. A consistent value platform that works in every market.'}</p>
              <p>{'Each year we back all markets with strong, centralised campaigns, shared themes, ready-to-use creative and clear activation frameworks, delivered through the DAM so local teams move faster and stay consistent. A Brand Board with every market represented steers the direction, chaired by Rik Lecot.'}</p>
              <p className="text-white">{'The ambition is simple: a sharper, more focused brand that is easy to manage, easy to activate, and stronger in every market. The smart, reliable alternative in professional tools.'}</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="glass glass-card glass-panel--glow rounded-2xl p-8">
              <div className="text-fog/60 text-xs uppercase tracking-wider mb-4">The survey told us</div>
              <p className="text-white text-xl leading-snug mb-4">{'“Good value for money” is a strong position, but on its own it reads cheap, and cheap erodes trust.'}</p>
              <p className="text-fog text-sm leading-relaxed">{'So we add professional cues, raise awareness, and let quality carry the price. Same job, told with more pride. That is the whole move.'}</p>
            </div>
          </Reveal>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 mt-10">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.t} delay={i * 90}>
              <div className="glass glass-card glass-panel--glow rounded-2xl p-7 h-full">
                <div className="text-stroxx-blue text-sm font-medium mb-2">0{i + 1}</div>
                <div className="text-white text-lg font-medium mb-2">{p.t}</div>
                <p className="text-fog text-sm leading-relaxed">{p.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* LOGO + DOWNLOADS */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-10">
        <Reveal><div className="eyebrow mb-6">The logo</div></Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          {LOGO_SETS.map((set) => (
            <Reveal key={set.name}>
              <div className="glass glass-card glass-panel--glow rounded-2xl p-6 h-full flex flex-col">
                <div className="rounded-xl grid place-items-center py-14 mb-5" style={{ background: set.dark ? '#0A0B0D' : '#F6F5F3', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={set.src} alt={`STROXX ${set.name}`} className="h-10 md:h-12 w-auto" />
                </div>
                <div className="text-white text-sm font-medium">{set.name}</div>
                <div className="text-fog text-xs mb-4">{set.note}</div>
                <div className="mt-auto space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-fog/50 text-[11px] uppercase tracking-wider w-14">Web</span>
                    {set.web.map((f) => <FmtLink key={f[0]} f={f} />)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-fog/50 text-[11px] uppercase tracking-wider w-14">Print</span>
                    {set.print.map((f) => <FmtLink key={f[0]} f={f} />)}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-6 text-fog text-sm leading-relaxed max-w-2xl">
            {'The wordmark exists in black or white only, and stands alone (the old “Proud Professionals” baseline is retired). Keep clear space of at least a third of the logo’s height on every side, and never stretch, recolour or add effects to it.'}
          </p>
        </Reveal>
      </section>

      {/* MOTION + EMBEDS */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-10">
        <Reveal><div className="eyebrow mb-6">Motion + embeds</div></Reveal>
        <Reveal>
          <p className="text-fog text-sm leading-relaxed max-w-2xl mb-8">
            {'An animated logo kit for reels, presentations and partner sites. Everything is self-contained, sits on a dark background, and keeps blue as the only accent. Grab a file or drop an embed onto any page.'}
          </p>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="glass glass-card glass-panel--glow rounded-2xl p-6 h-full flex flex-col">
              <LogoMotion src="/brand/motion/stroxx-logo-reveal.svg" alt="STROXX logo reveal animation" />
              <div className="text-white text-sm font-medium mt-4">Logo reveal (sting)</div>
              <div className="text-fog text-xs mb-4">The frame draws, then the letters rise in. For intros, headers and video.</div>
              <div className="mt-auto flex flex-wrap gap-2">
                <FmtLink f={['SVG', '/brand/motion/stroxx-logo-reveal.svg']} />
                <FmtLink f={['MP4 film', '/brand/motion/stroxx-logo.mp4']} />
                <FmtLink f={['GIF', '/brand/motion/stroxx-logo.gif']} />
              </div>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="glass glass-card glass-panel--glow rounded-2xl p-6 h-full flex flex-col">
              <LogoMotion src="/brand/motion/stroxx-logo-loop.svg" alt="STROXX living logo loop" />
              <div className="text-white text-sm font-medium mt-4">Living logo (loop)</div>
              <div className="text-fog text-xs mb-4">A blue light travels the frame, forever. For screens and websites.</div>
              <div className="mt-auto flex flex-wrap gap-2">
                <FmtLink f={['SVG', '/brand/motion/stroxx-logo-loop.svg']} />
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="glass glass-card glass-panel--glow rounded-2xl p-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className="rounded-xl overflow-hidden" style={{ background: '#0B0C0E', border: '1px solid rgba(255,255,255,0.06)' }}>
                <iframe src="/brand/motion/stroxx-particle-logo.html" title="STROXX particle logo" className="w-full" style={{ height: 220, border: 0 }} />
              </div>
              <div>
                <div className="text-white text-sm font-medium mb-1">Particle logo (interactive)</div>
                <p className="text-fog text-xs leading-relaxed mb-4">
                  {'Blue particles assemble into the mark and scatter from the cursor. Self-contained, no dependencies, drops onto any site. Download the file, or embed it:'}
                </p>
                <pre className="text-fog/80 text-[11px] leading-relaxed bg-ink/60 border border-line rounded-lg p-3 overflow-x-auto"><code>{'<iframe src="https://stroxx.eu/brand/motion/stroxx-particle-logo.html"\n  style="border:0;width:520px;height:200px" title="STROXX"></iframe>'}</code></pre>
                <div className="mt-4"><FmtLink f={['Download .html', '/brand/motion/stroxx-particle-logo.html']} /></div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* PALETTE / TYPE / INTERFACE / MOTION (code-owned rules, colour downloads live here) */}
      <BrandGuide />

      {/* IMAGERY */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-8">
        <Reveal><div className="eyebrow mb-6">Imagery</div></Reveal>
        <Reveal>
          <p className="text-fog text-sm leading-relaxed max-w-2xl mb-8">
            {'The brand shoots in black and white, always. Tools in real hands, workshops, honest and unposed, high contrast on the dark. A starter set is here; more is on the way. Click to view full size, or download.'}
          </p>
        </Reveal>
        <PhotoGallery images={GALLERY} />
      </section>

      {/* CAMPAIGN PHOTOGRAPHY */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-8">
        <Reveal><div className="eyebrow mb-6">Campaign photography</div></Reveal>
        <Reveal>
          <p className="text-fog text-sm leading-relaxed max-w-2xl mb-8">
            {'From the Prøv Det (Try It) campaign, the shared creative every market can run. Click to view full size, or download.'}
          </p>
        </Reveal>
        <PhotoGallery images={CAMPAIGN} />
      </section>

      {/* POSITIONING + VOICE */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-8">
        <Reveal><div className="eyebrow mb-6">Positioning + voice</div></Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal>
            <div className="glass glass-card glass-panel--glow rounded-2xl p-7 h-full">
              <div className="text-white text-lg font-medium mb-3">What STROXX is</div>
              <p className="text-fog leading-relaxed text-sm">
                {'A full range of professional tools, made and quality-assured by professionals, at a 1:1 quality with the A-brands a tradesman already trusts. The first thing your tools should build is trust; the price is the reward for choosing smart.'}
              </p>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="glass glass-card glass-panel--glow rounded-2xl p-7 h-full">
              <div className="text-white text-lg font-medium mb-3">Two hats</div>
              <p className="text-fog leading-relaxed text-sm mb-4">
                {'STROXX the brand convinces on quality and identity and never opens with price. STROXX at the dealer is where the buying and the pricing happen. The brand site routes to the dealer, it does not sell.'}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {DEALERS.map((d) => (
                  <div key={d.market} className="text-xs">
                    <span className="text-fog/60">{d.market}</span>{' '}
                    <span className="text-white">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="glass glass-card glass-panel--glow rounded-2xl p-7 h-full">
              <div className="text-white text-lg font-medium mb-3">How it sounds</div>
              <p className="text-fog leading-relaxed text-sm mb-4">
                {'Plain-spoken and confident, like a skilled colleague, not a catalogue. Short lines. Proof over adjectives. Calm and engineered, never loud.'}
              </p>
              <ul className="space-y-1.5 text-sm text-white/90">
                <li>“Tough and reliable. Just like your colleague.”</li>
                <li>“Cuts through everything. Including bullshit.”</li>
                <li>“Same feel. Far from the price.”</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DO / DON'T */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="glass glass-card glass-panel--glow rounded-2xl p-7 h-full">
              <div className="eyebrow mb-5" style={{ color: '#22c55e' }}>Do</div>
              <ul className="space-y-3">
                {DOS.map((d) => (
                  <li key={d} className="flex gap-3 text-fog text-sm leading-relaxed">
                    <span aria-hidden style={{ color: '#22c55e' }}>✓</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="glass glass-card glass-panel--glow rounded-2xl p-7 h-full">
              <div className="eyebrow mb-5" style={{ color: 'rgba(239,120,120,1)' }}>Don’t</div>
              <ul className="space-y-3">
                {DONTS.map((d) => (
                  <li key={d} className="flex gap-3 text-fog text-sm leading-relaxed">
                    <span aria-hidden style={{ color: 'rgba(239,120,120,1)' }}>✕</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal>
          <p className="mt-8 text-fog/70 text-xs leading-relaxed max-w-2xl pb-24">
            {'Type is the system Helvetica Neue stack, licence-free (download it from the type block above). Colour swatches and CSS tokens download from the palette. The full Brand Plan, playbook and brandbook stay internal, ask STROXX marketing for source files or the extended palette. One brand, four markets: Carl Ras, Meesenburg, Foussier, Lecot.'}
          </p>
        </Reveal>
      </section>
    </main>
  );
}
