import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import GlassButton from '@/components/GlassButton';

/** The living brand guide at the top of /komponenter: every color, type
 *  style and interface element of the STROXX design system, rendered by the
 *  real code (so it can never drift from the site). The block library below
 *  it completes the picture. */

const COLORS = [
  { name: 'STROXX blue', varName: 'stroxx-blue', hex: '#0088C2', note: 'The ONLY accent. Links, accents, active states, glows. Blue = interactive or emphasized.' },
  { name: 'Ink', varName: 'ink', hex: '#0B0C0E', note: 'The page background. Everything lives on dark.' },
  { name: 'Carbon', varName: 'carbon', hex: '#111317', note: 'Raised surfaces, input fields.' },
  { name: 'Steel', varName: 'steel', hex: '#171B21', note: 'Higher surfaces, confirmations.' },
  { name: 'Fog', varName: 'fog', hex: '#8A9199', note: 'Body text and secondary information.' },
  { name: 'Line', varName: 'line', hex: '#23272E', note: 'Hairlines and quiet borders, used sparingly.' },
  { name: 'White', varName: 'white', hex: '#FFFFFF', note: 'Headlines and primary text. Always bold in display sizes.' },
];

function Rule({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="text-white font-medium mb-2">{title}</div>
      <p className="text-fog text-sm leading-relaxed">{children}</p>
    </div>
  );
}

export default function BrandGuide() {
  return (
    <section className="mx-auto max-w-[1600px] px-6 md:px-10 pb-8">
      {/* ── colors ── */}
      <div className="eyebrow mb-6">Brand guide · Colors</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
        {COLORS.map((c) => (
          <div key={c.varName} className="glass-panel rounded-xl overflow-hidden">
            <div className="h-16" style={{ background: c.hex, borderBottom: '1px solid rgba(255,255,255,0.08)' }} />
            <div className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-white text-sm font-medium">{c.name}</span>
                <code className="text-fog/70 text-xs">{c.hex}</code>
              </div>
              <p className="text-fog text-xs leading-relaxed mt-1.5">{c.note}</p>
            </div>
          </div>
        ))}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="h-16" style={{ background: 'radial-gradient(80% 120% at 50% 100%, rgba(0,136,194,0.5), rgba(11,12,14,1) 80%)' }} />
          <div className="p-4">
            <div className="text-white text-sm font-medium">The blue glow</div>
            <p className="text-fog text-xs leading-relaxed mt-1.5">
              Radial blue gradients light scenes from behind or below. Light, never fill.
            </p>
          </div>
        </div>
      </div>

      {/* colour downloads live with the swatches */}
      <div className="flex flex-wrap gap-2 -mt-12 mb-16">
        <a href="/brand/STROXX-colors.ase" download className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink/50 px-3.5 py-1.5 text-xs text-fog transition-colors hover:border-stroxx-blue/50 hover:text-white">
          Adobe swatches (.ase)
        </a>
        <a href="/brand/stroxx-tokens.css" download className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink/50 px-3.5 py-1.5 text-xs text-fog transition-colors hover:border-stroxx-blue/50 hover:text-white">
          CSS tokens (.css)
        </a>
      </div>

      {/* ── typography ── */}
      <div className="eyebrow mb-6">Brand guide · Typography</div>
      <div className="glass-panel rounded-xl p-8 md:p-10 mb-16 space-y-10">
        <div>
          <div className="text-fog/60 text-xs uppercase tracking-wider mb-3">Display headline · h-display, white, tight leading</div>
          <div className="h-display text-white text-[clamp(2rem,5vw,4rem)] leading-[0.95]">
            Premium tools,<br />
            <span className="text-stroxx-blue">beastly</span> low prices.
          </div>
          <p className="text-fog text-sm mt-4 max-w-xl">
            One *asterisked* word per headline renders STROXX blue. Line breaks are deliberate (Enter in the CMS). Headlines are statements: short, bold, no trailing filler.
          </p>
        </div>
        <div>
          <div className="text-fog/60 text-xs uppercase tracking-wider mb-3">Eyebrow · small caps, tracks wide, always above headlines</div>
          <div className="eyebrow !mb-0">The eyebrow style</div>
        </div>
        <div>
          <div className="text-fog/60 text-xs uppercase tracking-wider mb-3">Body · fog on ink, relaxed leading; long-form articles use 1.15rem/1.8</div>
          <p className="text-fog leading-relaxed max-w-xl">
            Body text is fog, never pure white: white is reserved for headlines and <strong className="text-white">emphasis</strong>. Plain, honest sentences in the brand voice, no hype, no exclamation marks.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 -mt-12 mb-16">
        <span className="text-fog text-xs">Helvetica Neue, the system stack on screen, the full family for design.</span>
        <a href="/brand/fonts/HelveticaNeue.zip" download className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink/50 px-3.5 py-1.5 text-xs text-fog transition-colors hover:border-stroxx-blue/50 hover:text-white">
          Helvetica Neue (.zip)
        </a>
        <a href="/brand/stroxx-type.css" download className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink/50 px-3.5 py-1.5 text-xs text-fog transition-colors hover:border-stroxx-blue/50 hover:text-white">
          Type stack (.css)
        </a>
      </div>

      {/* ── elements ── */}
      <div className="eyebrow mb-6">Brand guide · Interface elements</div>
      <div className="glass-panel rounded-xl p-8 md:p-10 mb-16">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <GlassButton href="#">Primary action <ArrowRight size={16} /></GlassButton>
          <GlassButton href="#" variant="ghost">Secondary action</GlassButton>
          <Link href="#" className="link-arrow">Text link, always blue <ArrowRight size={15} /></Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="shrink-0 text-sm px-3.5 py-1.5 rounded-full border bg-stroxx-blue border-stroxx-blue text-white">Active chip</span>
          <span className="shrink-0 text-sm px-3.5 py-1.5 rounded-full border border-line text-fog">Filter chip</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border border-white/15 text-white/75">Tag pill</span>
          <span className="text-[10px] font-semibold tracking-wide px-2 py-1 rounded-sm bg-stroxx-blue text-white">VALUE</span>
        </div>
        <p className="text-fog text-sm max-w-2xl leading-relaxed">
          Buttons are the glass CTA (frosted, blue rim light, lifts on hover). Text links are STROXX blue with the arrow that nudges on hover. Chips filter, pills label. If it is clickable, it is blue or it glows.
        </p>
      </div>

      {/* ── the rules ── */}
      <div className="eyebrow mb-6">Brand guide · The rules</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-20">
        <Rule title="Photography is black and white">
          The design converts photos to B&W automatically. Only product cut-outs and the blue glow carry color, so the tools are the heroes.
        </Rule>
        <Rule title="Products float on glass">
          Product images are knockout cut-outs on dark glass cards with a soft blue light pool, never boxed photos on white.
        </Rule>
        <Rule title="No divider lines">
          Sections flow into each other with space and light, not hairlines. Depth comes from glass layers and glows.
        </Rule>
        <Rule title="Motion is code-owned">
          Reveals, scroll animation and the bag are locked in code. Editors change words and images; the feel stays premium by design.
        </Rule>
      </div>
    </section>
  );
}
