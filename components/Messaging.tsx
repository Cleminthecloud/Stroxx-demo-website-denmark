import Reveal from '@/components/Reveal';

/** Messaging & copy bank, grounded in the STROXX brand messaging + 2026 plan
 *  (INFO/Brand Strategy, INFO/Bit more info). The promise, the approved lines,
 *  how we write, and the words we live by / avoid. Code-owned, part of /brand. */

const LINES: { text: string; tag: string }[] = [
  { text: 'Premium tools. Unpremium prices.', tag: 'Value' },
  { text: 'Same feel. Far from the price.', tag: 'Value' },
  { text: 'Dyrt værktøj til udyr pris.', tag: 'Value · DK' },
  { text: 'We get you. We got you.', tag: 'Promise' },
  { text: 'You bring the craft. We bring the tools.', tag: 'Promise' },
  { text: 'Tools. Trust. Respect.', tag: 'Promise' },
  { text: 'Built for those who build with pride.', tag: 'Promise' },
  { text: 'Now you can afford more than just tools.', tag: 'Campaign' },
  { text: 'Try it for 30 days. Satisfied, or your money back.', tag: 'Guarantee' },
  { text: 'Black, bold, built to blend in, so your work can stand out.', tag: 'Brand' },
];

const TONE = [
  'Speak like a tradesperson, not a marketer. Straight, confident, no fluff.',
  'Respect is built in. Back the craftsman; never talk down, never oversell.',
  'Lead with quality and trust. Let the price be the positive surprise, never the opening line.',
  'Proof over adjectives. Specifics, tolerances, the trade. No hype, no exclamation marks.',
  'Short lines. White space. Say the true thing plainly and stop.',
];

const WRITE_DO = [
  'Same tolerances as the A-brand. A sharper price.',
  'Try it on real jobs for 30 days. Not for you? Money back, no questions.',
  'Made and tested by professionals, for professionals.',
];
const WRITE_DONT = [
  'The CHEAPEST tools on the market!!!',
  'Unbeatable budget bargains, buy now and save big!',
  'Amazing deals you won’t believe!',
];

const USE_WORDS = ['value', 'professional', 'trust', 'proof', 'quality', 'reliable', 'pride', 'try it', 'sharp price'];
const AVOID_WORDS = ['cheap', 'budget', 'discount', 'bargain', 'deal', 'hype', 'exclamation marks!'];

export default function Messaging() {
  return (
    <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-10">
      <Reveal><div className="eyebrow mb-6">Messaging + copy</div></Reveal>

      {/* the promise */}
      <Reveal>
        <div className="glass glass-card glass-panel--glow rounded-2xl p-8 md:p-10 mb-6">
          <div className="text-fog/60 text-xs uppercase tracking-wider mb-4">The promise</div>
          <p className="h-display text-white text-[clamp(1.8rem,4vw,3rem)] leading-[0.98] mb-5">
            We get you. <span className="text-stroxx-blue">We got you.</span>
          </p>
          <p className="text-fog leading-relaxed max-w-2xl">
            {'We totally get you, we’ve got everything you need, and we’ve always got your back. Skilled work deserves more than fair pay; it deserves respect. When the work matters, the tools should too.'}
          </p>
        </div>
      </Reveal>

      {/* approved lines bank */}
      <Reveal><div className="eyebrow mb-5">Approved lines</div></Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {LINES.map((l, i) => (
          <Reveal key={l.text} delay={(i % 3) * 70}>
            <div className="glass glass-card glass-panel--glow rounded-2xl p-6 h-full flex flex-col justify-between">
              <p className="text-white text-lg leading-snug mb-4">“{l.text}”</p>
              <span className="text-fog/50 text-[11px] uppercase tracking-wider">{l.tag}</span>
            </div>
          </Reveal>
        ))}
      </div>

      {/* how we write */}
      <Reveal><div className="eyebrow mb-5">How we write</div></Reveal>
      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <Reveal>
          <div className="glass glass-card glass-panel--glow rounded-2xl p-7 h-full">
            <ul className="space-y-3">
              {TONE.map((t) => (
                <li key={t} className="flex gap-3 text-fog text-sm leading-relaxed">
                  <span aria-hidden className="text-stroxx-blue">—</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={90}>
          <div className="grid gap-4">
            <div className="glass glass-card rounded-2xl p-6">
              <div className="eyebrow mb-4" style={{ color: '#22c55e' }}>Write it like this</div>
              <ul className="space-y-2.5">
                {WRITE_DO.map((d) => (
                  <li key={d} className="flex gap-3 text-fog text-sm leading-relaxed"><span aria-hidden style={{ color: '#22c55e' }}>✓</span> “{d}”</li>
                ))}
              </ul>
            </div>
            <div className="glass glass-card rounded-2xl p-6">
              <div className="eyebrow mb-4" style={{ color: 'rgba(239,120,120,1)' }}>Not like this</div>
              <ul className="space-y-2.5">
                {WRITE_DONT.map((d) => (
                  <li key={d} className="flex gap-3 text-fog text-sm leading-relaxed"><span aria-hidden style={{ color: 'rgba(239,120,120,1)' }}>✕</span> “{d}”</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      {/* words */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="glass glass-card rounded-2xl p-7 h-full">
            <div className="text-white text-sm font-medium mb-4">Words we use</div>
            <div className="flex flex-wrap gap-2">
              {USE_WORDS.map((w) => (
                <span key={w} className="rounded-full border border-stroxx-blue/40 bg-stroxx-blue/10 px-3.5 py-1.5 text-xs text-white">{w}</span>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={90}>
          <div className="glass glass-card rounded-2xl p-7 h-full">
            <div className="text-white text-sm font-medium mb-4">Words we avoid</div>
            <div className="flex flex-wrap gap-2">
              {AVOID_WORDS.map((w) => (
                <span key={w} className="rounded-full border border-line px-3.5 py-1.5 text-xs text-fog line-through">{w}</span>
              ))}
            </div>
            <p className="text-fog/70 text-xs leading-relaxed mt-4">{'“Cheap” erodes trust, that is exactly the trap the brand survey warned against. We are the smart, reliable alternative, not the bargain bin.'}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
