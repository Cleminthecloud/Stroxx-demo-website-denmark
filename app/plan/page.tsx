'use client';
import { useState } from 'react';
import Link from 'next/link';
import GlassButton from '@/components/GlassButton';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

type PhaseId = 'kickoff' | 'build' | 'review' | 'release' | 'rollout';

const PHASES: { id: PhaseId; n: string; when: string; title: string; desc: string }[] = [
  { id: 'kickoff', n: '01', when: 'Week 1', title: 'Kickoff week',
    desc: 'We sit together: build the missing features, stand up the PIM & DAM integrations, decide what’s CMS vs code, align with IT on hosting & security, and set the SEO / GEO / AI and content plans.' },
  { id: 'build', n: '02', when: 'Weeks 2–3', title: 'Build to stable',
    desc: 'Integrate the headless CMS, make every page fully responsive, load the real copy & imagery from the DAM, and harden it — performance, accessibility, analytics, consent.' },
  { id: 'review', n: '03', when: 'Week 3–4', title: 'Review & correct',
    desc: 'We present the working site; Carl Ras reviews it hands-on on real devices. All feedback and refinements captured in one structured pass.' },
  { id: 'release', n: '04', when: 'Weeks 4–5', title: 'Fine-tune & release',
    desc: 'Action the corrections, final QA, and brand / legal / IT sign-off — then STROXX Denmark goes live on its own domain.' },
  { id: 'rollout', n: '05', when: 'Onward', title: 'Market rollout',
    desc: 'A partner questionnaire feeds a central database, driving a repeatable build for Germany, France & Belgium off the shared foundation — each in its own language, data and shop.' },
];

type Kind = 'b1' | 'b2' | 'b3' | 'ms' | 'msBlue';
type Row = { label: string; sub?: string; phase: PhaseId; s: number; e: number; kind: Kind; text?: string; tip: string };

const DK_ROWS: Row[] = [
  { label: 'Kickoff week', sub: 'build · integrate · decide', phase: 'kickoff', s: 2, e: 3, kind: 'b1', text: 'Together', tip: 'One focused week side by side — features built, integrations kicked off, and every key decision locked.' },
  { label: 'PIM + DAM integration', sub: 'live data · real images', phase: 'kickoff', s: 2, e: 5, kind: 'b1', text: 'Live product data & imagery', tip: 'Connect live Carl Ras product data and pull real transparent imagery from the DAM — replacing the demo data and the temporary image workaround.' },
  { label: 'Headless CMS', sub: 'marketing edits, no code', phase: 'build', s: 3, e: 5, kind: 'b1', text: 'Integrate & migrate', tip: 'Stand up the CMS and migrate content so marketing can edit pages & campaigns with preview — no developer needed.' },
  { label: 'Responsive build', sub: 'phone · tablet · desktop', phase: 'build', s: 3, e: 5, kind: 'b1', text: 'Responsive', tip: 'A first-class experience on every screen size.' },
  { label: 'Content', sub: 'copy · imagery · approvals', phase: 'build', s: 3, e: 6, kind: 'b2', text: 'Load & approve', tip: 'Final Danish copy, DAM product shots, campaign & specialist imagery — loaded and brand-approved.' },
  { label: 'Hardening', sub: 'perf · a11y · analytics · consent', phase: 'build', s: 3, e: 6, kind: 'b2', text: 'Harden', tip: 'Performance, accessibility (WCAG AA), analytics, cookie consent, and the Pro Club sign-up.' },
  { label: 'Review & corrections', phase: 'review', s: 4, e: 6, kind: 'b1', text: 'Present → correct', tip: 'Present the working site; capture all feedback in one structured pass.' },
  { label: 'Fine-tune · QA · sign-off', phase: 'release', s: 5, e: 7, kind: 'b1', text: 'Polish & sign-off', tip: 'Action corrections, final QA, and brand / legal / IT sign-off.' },
  { label: 'Denmark live', phase: 'release', s: 6, e: 7, kind: 'msBlue', tip: 'STROXX Denmark goes live on its own domain.' },
];
const ROLLOUT_ROWS: Row[] = [
  { label: 'Partner questionnaire', sub: '→ central database', phase: 'rollout', s: 2, e: 8, kind: 'b3', text: 'Send early · collect specs', tip: 'A structured questionnaire to each partner (systems, shop links, languages, range, legal) — answers stored per market in a database.' },
  { label: 'Market 1', sub: 'template build', phase: 'rollout', s: 7, e: 11, kind: 'b3', text: 'Language · data · shop links', tip: 'First partner market built as the repeatable template off the shared foundation.' },
  { label: 'Markets 2 & 3', sub: 'repeat, faster', phase: 'rollout', s: 10, e: 15, kind: 'b3', text: 'Configure off the foundation', tip: 'Remaining markets configured from the foundation — each faster than the last.' },
  { label: 'All markets live', phase: 'rollout', s: 14, e: 15, kind: 'ms', tip: 'Germany, France and Belgium live — each localised.' },
];

const BAR_BG: Record<Kind, string> = {
  b1: 'linear-gradient(90deg,#0082CA,#1c5e86)',
  b2: 'linear-gradient(90deg,#10628f,#123f5b)',
  b3: 'linear-gradient(90deg,#3a4654,#272d36)',
  ms: '', msBlue: '',
};

const COLS = '180px repeat(13,minmax(0,1fr))';

export default function PlanPage() {
  const [active, setActive] = useState<PhaseId | null>(null);
  const [detail, setDetail] = useState<string>('Hover a bar for detail · tap a phase to highlight its timeline.');

  const rowOn = (r: Row) => active === null || r.phase === active;

  const Bar = (r: Row) => {
    const dim = !rowOn(r);
    if (r.kind === 'ms' || r.kind === 'msBlue') {
      return (
        <div style={{ gridColumn: `${r.s}/${r.e}` }} className="flex items-center justify-center"
          onMouseEnter={() => setDetail(r.tip)}>
          <span className="block h-3.5 w-3.5 rotate-45 rounded-[3px]" style={{
            background: r.kind === 'msBlue' ? '#2C93E0' : '#37B24D',
            boxShadow: `0 0 14px ${r.kind === 'msBlue' ? 'rgba(44,147,224,.55)' : 'rgba(55,178,77,.5)'}`,
            opacity: dim ? 0.3 : 1, transition: 'opacity .3s ease',
          }} />
        </div>
      );
    }
    return (
      <div onMouseEnter={() => setDetail(r.tip)} title={r.tip}
        className="flex items-center overflow-hidden rounded-full px-2.5 cursor-default"
        style={{
          gridColumn: `${r.s}/${r.e}`, background: BAR_BG[r.kind], height: 17,
          boxShadow: r.kind === 'b1' && !dim ? '0 0 16px rgba(0,130,202,.22)' : 'none',
          opacity: dim ? 0.32 : 1, transition: 'opacity .3s ease',
        }}>
        <span className="truncate text-[10px] text-[#dff0fb]">{r.text}</span>
      </div>
    );
  };

  return (
    <main className="bg-ink min-h-screen">
      {/* hero */}
      <section className="mx-auto max-w-[1180px] px-6 md:px-10 pt-32 md:pt-40 pb-10">
        <div className="eyebrow mb-5">Projektplan</div>
        <h1 className="h-display text-white text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[0.98] mb-5">
          Fra demo til live.<br /><span className="text-fog">Bygget til at skalere.</span>
        </h1>
        <p className="text-fog text-base md:text-lg leading-relaxed max-w-2xl mb-9">
          A focused kickoff week to build and decide together, a stable build with a marketing-friendly CMS,
          one clean review pass, then live in Denmark for Carl Ras — followed by a repeatable,
          questionnaire-driven rollout to Germany, France and Belgium off the same foundation.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <GlassButton href="/">Explore the live site <ArrowRight size={16} /></GlassButton>
          <a href="#timeline" className="link-arrow text-sm">See the timeline <ArrowRight size={15} /></a>
        </div>
      </section>

      {/* process */}
      <section className="mx-auto max-w-[1180px] px-6 md:px-10 py-8">
        <h2 className="text-[13px] tracking-[0.16em] uppercase text-fog font-semibold mb-2">The process at a glance</h2>
        <p className="text-fog/60 text-xs mb-6">Tap a phase to highlight it on the timeline below.</p>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          {PHASES.map((p) => {
            const on = active === p.id;
            return (
              <button key={p.id} type="button" onClick={() => setActive(on ? null : p.id)}
                className="text-left rounded-xl border p-4 transition-all duration-300"
                style={{
                  background: on ? 'rgba(0,130,202,0.10)' : '#14161A',
                  borderColor: on ? 'rgba(44,147,224,0.55)' : '#2A2D33',
                  boxShadow: on ? '0 0 26px rgba(0,130,202,0.18)' : 'none',
                }}>
                <div className="text-[11px] tracking-[0.14em] font-semibold mb-2"
                  style={{ color: p.id === 'rollout' ? '#9aa6b5' : '#2C93E0' }}>{p.n} · {p.when.toUpperCase()}</div>
                <div className="text-white text-[15px] font-medium mb-1.5">{p.title}</div>
                <p className="text-fog text-xs leading-relaxed">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* timeline */}
      <section id="timeline" className="mx-auto max-w-[1180px] px-6 md:px-10 py-8 scroll-mt-28">
        <h2 className="text-[13px] tracking-[0.16em] uppercase text-fog font-semibold mb-6">Timeline</h2>

        <div className="rounded-2xl border border-line bg-[#14161A] p-5 md:p-6 overflow-x-auto">
          <div className="min-w-[760px]">
            {/* week header */}
            <div className="grid items-center" style={{ gridTemplateColumns: COLS }}>
              <div className="text-[11px] text-[#5E646D]">Workstream</div>
              {Array.from({ length: 13 }, (_, i) => (
                <div key={i} className="text-center text-[11px] text-[#5E646D] pb-3">W{i + 1}</div>
              ))}
            </div>

            <div className="text-[10.5px] tracking-[0.16em] uppercase text-fog font-semibold pb-2 pt-1">Denmark · Carl Ras</div>
            {DK_ROWS.map((r) => (
              <div key={r.label} className="grid items-center min-h-[34px]" style={{ gridTemplateColumns: COLS }}>
                <div className="pr-3 leading-tight" style={{ opacity: rowOn(r) ? 1 : 0.4, transition: 'opacity .3s' }}>
                  <span className="block text-[12px] text-white">{r.label}</span>
                  {r.sub && <span className="block text-[10px] text-[#5E646D] mt-0.5">{r.sub}</span>}
                </div>
                {Bar(r)}
              </div>
            ))}

            <div className="text-[10.5px] tracking-[0.16em] uppercase text-fog font-semibold pb-2 pt-4 mt-3 border-t border-line">Partner markets · DE · FR · BE</div>
            {ROLLOUT_ROWS.map((r) => (
              <div key={r.label} className="grid items-center min-h-[34px]" style={{ gridTemplateColumns: COLS }}>
                <div className="pr-3 leading-tight" style={{ opacity: rowOn(r) ? 1 : 0.4, transition: 'opacity .3s' }}>
                  <span className="block text-[12px] text-white">{r.label}</span>
                  {r.sub && <span className="block text-[10px] text-[#5E646D] mt-0.5">{r.sub}</span>}
                </div>
                {Bar(r)}
              </div>
            ))}
          </div>
        </div>

        {/* live detail line */}
        <div className="mt-3 text-[12.5px] text-fog leading-relaxed min-h-[20px]">{detail}</div>

        {/* legend */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11.5px] text-fog">
          <span className="inline-flex items-center gap-2"><i className="inline-block h-2.5 w-5 rounded-full" style={{ background: BAR_BG.b1 }} />Core build (Denmark)</span>
          <span className="inline-flex items-center gap-2"><i className="inline-block h-2.5 w-5 rounded-full" style={{ background: BAR_BG.b2 }} />Content & hardening</span>
          <span className="inline-flex items-center gap-2"><i className="inline-block h-2.5 w-5 rounded-full" style={{ background: BAR_BG.b3 }} />Market rollout</span>
          <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rotate-45 rounded-[2px]" style={{ background: '#2C93E0' }} />Denmark live</span>
          <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rotate-45 rounded-[2px]" style={{ background: '#37B24D' }} />All markets live</span>
        </div>

        {/* access note */}
        <div className="mt-7 rounded-xl border border-line bg-[#191C21] border-l-[3px] border-l-stroxx-blue p-4 md:p-5 text-fog text-[12.5px] leading-relaxed">
          <span className="text-white font-semibold">One thing sets the pace:</span> access to the Carl Ras PIM & DAM.
          Everything in the build track can be done before access lands, so lining it up ahead of the kickoff is the
          single highest-leverage move. The partner questionnaires go out in week 1 in parallel, so the rollout is
          planned on facts — confirming whether each partner runs the same systems — rather than guesses.
        </div>
        <p className="mt-4 text-[#5E646D] text-[11px]">Indicative timeline. Weeks shown are working phases; go-live timing also depends on access and brand / legal / IT sign-offs.</p>
      </section>

      {/* CTA into the site */}
      <section className="mx-auto max-w-[1180px] px-6 md:px-10 py-16">
        <div className="rounded-2xl border border-line p-8 md:p-12 text-center relative overflow-hidden"
          style={{ background: 'radial-gradient(120% 140% at 50% 0%, rgba(0,130,202,0.14), transparent 60%), #14161A' }}>
          <div className="eyebrow mb-4">Det levende site</div>
          <h2 className="h-display text-white text-[clamp(1.8rem,4vw,3rem)] leading-[0.98] mb-6">See it for yourself.</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <GlassButton href="/">Open the STROXX demo <ArrowUpRight size={16} /></GlassButton>
            <Link href="/produkter" className="link-arrow text-sm">Browse the products <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
