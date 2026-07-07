import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import BrandGuide from '@/components/BrandGuide';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Brand guide',
  robots: { index: false, follow: false },
};

/** The brand hub, one shared, code-owned page for every market (DK / DE / FR /
 *  BE): the logo and its download pack, the palette / type / interface / motion
 *  rules (BrandGuide), and the positioning and voice, grounded in the 2024
 *  brandbook (INFO/Brand Information). Managed by us, not the CMS. The full
 *  Brand Playbook PDF stays internal (INFO/), not on the site. */

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

const ASSETS: { href: string; label: string; note: string }[] = [
  { href: '/brand/STROXX-colors.ase', label: 'Adobe swatches (.ase)', note: 'Photoshop, Illustrator, InDesign' },
  { href: '/brand/stroxx-tokens.css', label: 'CSS tokens (.css)', note: 'Web and email developers' },
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
  'Talk price on the brand side, that is the dealer’s job.',
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
            One brand. <span className="text-stroxx-blue">Two hats.</span>
          </h1>
          <p className="mt-6 text-fog text-lg leading-relaxed max-w-2xl">
            {'Professional tools, developed and quality-assured by professionals, the quality is 1:1 with the branded tools a tradesman uses today; the price is simply better. This is the shared brand hub for every market: the logo, the rules, the voice. Take what you need.'}
          </p>
        </Reveal>
      </div>

      {/* LOGO + DOWNLOADS */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-10">
        <Reveal><div className="eyebrow mb-6">The logo</div></Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          {LOGO_SETS.map((set) => (
            <Reveal key={set.name}>
              <div className="glass glass-card rounded-2xl p-6 h-full flex flex-col">
                <div
                  className="rounded-xl grid place-items-center py-14 mb-5"
                  style={{ background: set.dark ? '#0A0B0D' : '#F6F5F3', border: '1px solid rgba(255,255,255,0.06)' }}
                >
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

      {/* PALETTE / TYPE / INTERFACE / MOTION (code-owned rules) */}
      <BrandGuide />

      {/* POSITIONING + VOICE */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-8">
        <Reveal><div className="eyebrow mb-6">Positioning + voice</div></Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal>
            <div className="glass glass-card rounded-2xl p-7 h-full">
              <div className="text-white text-lg font-medium mb-3">What STROXX is</div>
              <p className="text-fog leading-relaxed text-sm">
                {'A full range of professional hand tools, made and quality-assured by professionals. Same feel and performance as the A-brands a tradesman already trusts, at a sharper price. Proud, precise, engineered, never cheap.'}
              </p>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="glass glass-card rounded-2xl p-7 h-full">
              <div className="text-white text-lg font-medium mb-3">Two hats</div>
              <p className="text-fog leading-relaxed text-sm">
                {'STROXX the brand convinces on quality and identity and never talks price. STROXX at the dealer (Carl Ras in DK) is where the buying and the pricing happen. The brand site routes to the dealer, it does not sell.'}
              </p>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="glass glass-card rounded-2xl p-7 h-full">
              <div className="text-white text-lg font-medium mb-3">How it sounds</div>
              <p className="text-fog leading-relaxed text-sm">
                {'Plain-spoken and confident, like a skilled colleague, not a catalogue. Short lines. Proof over adjectives. Blue is the only accent; the tone is calm and engineered, never loud or bouncy.'}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DO / DON'T */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="glass glass-card rounded-2xl p-7 h-full">
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
            <div className="glass glass-card rounded-2xl p-7 h-full">
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
      </section>

      {/* DOWNLOADS (colours + tokens) */}
      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-8 pb-32">
        <Reveal><div className="eyebrow mb-4">Take the colours with you</div></Reveal>
        <div className="flex flex-wrap gap-3">
          {ASSETS.map((d, i) => (
            <Reveal key={d.href} delay={i * 80}>
              <a
                href={d.href}
                download
                className="glass glass-card flex items-center gap-4 rounded-xl px-6 py-4 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full border border-stroxx-blue/40 text-stroxx-blue">
                  <Download size={17} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-white text-sm font-medium">{d.label}</span>
                  <span className="block text-fog text-xs">{d.note}</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-6 text-fog/70 text-xs leading-relaxed max-w-2xl">
            {'Brand font is Aller; the site uses the system Helvetica Neue stack as the licence-free stand-in. The full Brand Playbook and brandbook stay internal, ask STROXX marketing for the source files or the extended palette.'}
          </p>
        </Reveal>
      </section>
    </main>
  );
}
