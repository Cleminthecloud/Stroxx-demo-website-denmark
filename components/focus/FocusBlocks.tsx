import { ArrowRight, Check, X } from 'lucide-react';
import Reveal from '@/components/Reveal';
import Accent from '@/components/Accent';
import ScrollText from '@/components/ScrollText';
import GlassButton from '@/components/GlassButton';
import CountUp from '@/components/CountUp';
import DealerLink from '@/components/focus/DealerLink';
import NumberedTabs from '@/components/focus/NumberedTabs';
import FilmPlayer from '@/components/focus/FilmPlayer';
import RangeAdvisor from '@/components/focus/RangeAdvisor';
import { assetUrl } from '@/sanity/lib/image';
import { isForeignDealerUrl, localizeHref, safeHref } from '@/lib/focus';
import type { LandingSection } from '@/lib/cms';

/** Renderers for the Focus on… section blocks (schemas in
 *  sanity/schemaTypes/focusBlocks.ts). Same art direction as the landing
 *  blocks: ink background, glass/carbon panels, STROXX blue for the one thing
 *  that matters, product shots in colour and scenes in black and white. */

export type BlockCtx = { prefix: string; market: string };

type Img = { alt?: string } | null | undefined;
const alt = (img: unknown) => ((img as Img)?.alt && typeof (img as Img)?.alt === 'string' ? ((img as Img)!.alt as string) : '');
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** An editor link made safe for this market: javascript:/data: dropped,
 *  internal paths kept in the visitor's locale, another market's dealer shop
 *  removed (the caller then falls back to the dealer chooser or hides it). */
function marketHref(href: unknown, ctx: BlockCtx): string {
  const h = safeHref(str(href));
  if (!h || isForeignDealerUrl(h, ctx.market)) return '';
  return localizeHref(h, ctx.prefix);
}

function Head({ eyebrow, headline, intro, center = false, className = 'mb-12 md:mb-14' }: { eyebrow?: string; headline?: string; intro?: string; center?: boolean; className?: string }) {
  if (!eyebrow && !headline && !intro) return null;
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      {eyebrow && (
        <Reveal>
          <div className="eyebrow mb-6">{eyebrow}</div>
        </Reveal>
      )}
      {headline && <ScrollText as="h2" text={headline} className="h-display text-[clamp(2rem,4.6vw,3.8rem)] leading-[0.96] text-white" />}
      {intro && (
        <Reveal delay={100}>
          <p className={`mt-5 text-lg leading-relaxed text-fog ${center ? 'mx-auto' : ''} max-w-2xl`}>
            <Accent text={intro} />
          </p>
        </Reveal>
      )}
    </div>
  );
}

const Wrap = ({ children, narrow = false, id }: { children: React.ReactNode; narrow?: boolean; id?: string }) => (
  <section id={id} className="relative">
    <div className={`mx-auto ${narrow ? 'max-w-5xl' : 'max-w-[1600px]'} px-6 py-20 md:px-10 md:py-28`}>{children}</div>
  </section>
);

/* ── textIntro ────────────────────────────────────────────────────────────── */
export function TextIntro({ s, ctx }: { s: LandingSection; ctx: BlockCtx }) {
  const center = s.align === 'center';
  const href = marketHref(s.ctaHref, ctx);
  return (
    <Wrap>
      <Head eyebrow={s.eyebrow} headline={s.headline} intro={s.intro} center={center} className="mb-0" />
      {(s.ctaLabel || s.note) && (
        <Reveal delay={140}>
          <div className={`mt-8 max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
            {s.ctaLabel &&
              (href ? (
                <GlassButton href={href} external={/^https?:/i.test(href)}>
                  {s.ctaLabel} <ArrowRight size={16} />
                </GlassButton>
              ) : (
                <DealerLink itemNumber={s.itemNumber} className="glass-cta inline-flex items-center gap-2">
                  <span>{s.ctaLabel}</span> <ArrowRight size={16} />
                </DealerLink>
              ))}
            {s.note && <p className="mt-6 max-w-2xl text-sm leading-relaxed text-fog/80">{s.note}</p>}
          </div>
        </Reveal>
      )}
    </Wrap>
  );
}

/* ── numberedTabs ─────────────────────────────────────────────────────────── */
export function NumberedTabsBlock({ s }: { s: LandingSection }) {
  const items = list<Record<string, unknown>>(s.items).map((it) => ({
    title: str(it.title),
    body: str(it.body),
    img: assetUrl(it.imageUpload, 1400),
    alt: alt(it.imageUpload),
    colour: it.colour !== false,
  }));
  if (!items.length) return null;
  return (
    <Wrap>
      <Head eyebrow={s.eyebrow} headline={s.headline} intro={s.intro} />
      <NumberedTabs items={items} />
    </Wrap>
  );
}

/* ── filmSection ──────────────────────────────────────────────────────────── */
export function FilmSection({ s }: { s: LandingSection }) {
  const src = safeHref(str(s.videoFileUrl) || str(s.videoUrl));
  if (!src) return null;
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(55% 60% at 50% 50%, rgba(0,136,194,0.12), transparent 72%)' }} />
      <div className={`relative mx-auto ${s.ratio === '4/5' ? 'max-w-2xl' : s.ratio === '1/1' ? 'max-w-3xl' : 'max-w-[1400px]'} px-6 py-20 md:px-10 md:py-28`}>
        <Head eyebrow={s.eyebrow} headline={s.headline} />
        <Reveal>
          <FilmPlayer src={src} poster={assetUrl(s.posterUpload, 1600) || undefined} ratio={s.ratio} label={str(s.headline) || str(s.caption) || 'Film'} />
        </Reveal>
        {(s.caption || s.footnote) && (
          <div className={`mt-5 flex flex-col gap-2 ${s.ratio === '4/5' || s.ratio === '1/1' ? '' : 'md:flex-row md:items-start md:justify-between md:gap-10'}`}>
            {s.caption && <p className="max-w-2xl leading-relaxed text-fog">{s.caption}</p>}
            {s.footnote && <p className="shrink-0 text-xs uppercase tracking-wider text-fog/70">{s.footnote}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── comparisonTable ──────────────────────────────────────────────────────── */
function Cell({ v }: { v: string }) {
  const t = v.trim();
  if (t === '+' || t.toLowerCase() === 'yes' || t.toLowerCase() === 'ja')
    return (
      <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-stroxx-blue/20 text-stroxx-blueGlow">
        <Check size={16} aria-hidden />
        <span className="sr-only">✓</span>
      </span>
    );
  if (t === '-' || t === '–' || t.toLowerCase() === 'no' || t.toLowerCase() === 'nej')
    return (
      <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-white/5 text-fog/70">
        <X size={15} aria-hidden />
        <span className="sr-only">✕</span>
      </span>
    );
  return <span>{t}</span>;
}

export function ComparisonTable({ s }: { s: LandingSection }) {
  const cols = list<Record<string, unknown>>(s.columns);
  const rows = list<Record<string, unknown>>(s.rows);
  const notes = list<Record<string, unknown>>(s.notes);
  if (cols.length < 2 || !rows.length) return null;
  const hiIdx = cols.findIndex((c) => c.highlight);
  return (
    <Wrap>
      <Head eyebrow={s.eyebrow} headline={s.headline} intro={s.intro} center />
      <Reveal>
        <div className="relative overflow-x-auto rounded-2xl border border-line bg-carbon [scrollbar-width:thin]" tabIndex={0} role="region" aria-label={str(s.headline) || 'Comparison'}>
          <table className="w-full min-w-[640px] border-collapse text-left text-sm md:text-base">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-[28%] bg-carbon px-5 py-5 align-bottom text-xs font-medium uppercase tracking-wider text-fog">
                  {s.cornerLabel || ''}
                </th>
                {cols.map((c, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={`px-5 py-5 align-bottom font-medium text-white ${i === hiIdx ? 'bg-stroxx-blue/[0.10] shadow-[inset_0_2px_0_#0088C2]' : ''}`}
                  >
                    {str(c.tag) && <span className="mb-2 inline-block rounded-full bg-stroxx-blue px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">{str(c.tag)}</span>}
                    <span className="block text-base md:text-lg">{str(c.name)}</span>
                    {str(c.note) && <span className="mt-1 block text-xs font-normal leading-snug text-fog">{str(c.note)}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => {
                const cells = list<string>(r.cells);
                return (
                  <tr key={ri} className="border-t border-line">
                    <th scope="row" className="sticky left-0 z-10 bg-carbon px-5 py-4 align-top font-normal text-fog">
                      {str(r.label)}
                    </th>
                    {cols.map((_, ci) => (
                      <td key={ci} className={`px-5 py-4 align-top text-white/90 ${ci === hiIdx ? 'bg-stroxx-blue/[0.06]' : ''}`}>
                        <Cell v={str(cells[ci])} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>
      {notes.length > 0 && (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {notes.map((n, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="h-full rounded-2xl border border-line p-6">
                {str(n.title) && <div className="mb-2 font-medium text-white">{str(n.title)}</div>}
                {str(n.body) && <p className="text-sm leading-relaxed text-fog">{str(n.body)}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </Wrap>
  );
}

/* ── bentoCompare ─────────────────────────────────────────────────────────── */
export function BentoCompare({ s }: { s: LandingSection }) {
  const tiles = list<Record<string, unknown>>(s.tiles);
  if (!tiles.length) return null;
  const A = str(s.labelA) || 'A';
  const B = str(s.labelB) || 'B';
  return (
    <Wrap>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {s.title && <h3 className="h-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-white">{s.title}</h3>}
        <div className="flex gap-4 text-xs uppercase tracking-wider" aria-hidden>
          <span className="flex items-center gap-2 text-fog"><span className="h-2.5 w-2.5 rounded-full bg-white/30" />{A}</span>
          <span className="flex items-center gap-2 text-white"><span className="h-2.5 w-2.5 rounded-full bg-stroxx-blue" />{B}</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-6">
        {tiles.map((t, i) => (
          <Reveal key={i} delay={(i % 3) * 90} className={t.wide ? 'md:col-span-3' : 'md:col-span-2'}>
            <article className="flex h-full flex-col rounded-2xl border border-line bg-carbon p-6">
              <p className="mb-4 text-xs uppercase tracking-wider text-fog">
                <span className="mr-2 text-stroxx-blueGlow">{String(i + 1).padStart(2, '0')}</span>
                {str(t.question)}
              </p>
              <dl className="grid gap-3">
                <div className="rounded-xl bg-white/[0.03] px-4 py-3">
                  <dt className="mb-1 text-[11px] uppercase tracking-wider text-fog">{A}</dt>
                  <dd className="text-fog">{str(t.a)}</dd>
                </div>
                <div className="rounded-xl border border-stroxx-blue/40 bg-stroxx-blue/[0.08] px-4 py-3">
                  <dt className="mb-1 text-[11px] uppercase tracking-wider text-stroxx-blueGlow">{B}</dt>
                  <dd className="text-white">{str(t.b)}</dd>
                </div>
              </dl>
              {str(t.why) && <p className="mt-4 text-sm leading-relaxed text-fog">{str(t.why)}</p>}
            </article>
          </Reveal>
        ))}
      </div>
    </Wrap>
  );
}

/* ── specGrid ─────────────────────────────────────────────────────────────── */
export function SpecGrid({ s }: { s: LandingSection }) {
  const specs = list<Record<string, unknown>>(s.specs);
  if (!specs.length) return null;
  return (
    <Wrap>
      <Head eyebrow={s.eyebrow} headline={s.headline} intro={s.intro} />
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {specs.map((sp, i) => {
          const v = str(sp.value);
          const countable = /^\d{1,6}$/.test(v);
          return (
            <Reveal key={i} delay={(i % 3) * 80}>
              <div className="border-t-2 border-stroxx-blue pt-5">
                <div className="h-display text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-white">
                  {countable ? <CountUp value={Number(v)} /> : v}
                </div>
                {str(sp.unit) && <div className="mt-2 font-medium text-white">{str(sp.unit)}</div>}
                {str(sp.body) && <p className="mt-2 text-sm leading-relaxed text-fog">{str(sp.body)}</p>}
              </div>
            </Reveal>
          );
        })}
      </div>
      {s.note && <p className="mt-12 max-w-3xl text-sm leading-relaxed text-fog/80">{s.note}</p>}
    </Wrap>
  );
}

/* ── modelCards ───────────────────────────────────────────────────────────── */
export function ModelCards({ s, ctx }: { s: LandingSection; ctx: BlockCtx }) {
  const cards = list<Record<string, unknown>>(s.cards);
  if (!cards.length) return null;
  return (
    <Wrap>
      {(s.title || s.intro) && (
        <div className="mb-10 max-w-3xl">
          {s.title && <h3 className="h-display text-[clamp(1.8rem,3.4vw,2.8rem)] leading-tight text-white">{s.title}</h3>}
          {s.intro && <p className="mt-4 text-lg leading-relaxed text-fog">{s.intro}</p>}
        </div>
      )}
      <div className={`grid gap-5 ${cards.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {cards.map((c, i) => {
          const rows = list<Record<string, unknown>>(c.rows);
          const href = marketHref(c.href, ctx);
          const hasLink = Boolean(str(c.linkLabel) && (href || str(c.itemNumber) || str(c.href)));
          const body = (
            <>
              <div className="mb-1 text-xl font-medium text-white">{str(c.name)}</div>
              {str(c.use) && <div className={`mb-5 text-sm ${c.highlight ? 'text-stroxx-blueGlow' : 'text-fog'}`}>{str(c.use)}</div>}
              <dl className="grid gap-0">
                {rows.map((r, ri) => (
                  <div key={ri} className="flex justify-between gap-4 border-t border-line py-2.5 text-sm">
                    <dt className="text-fog">{str(r.key)}</dt>
                    <dd className="text-right text-white">{str(r.value)}</dd>
                  </div>
                ))}
              </dl>
              {hasLink && (
                <span className="mt-5 inline-flex items-center gap-2 text-sm text-stroxx-blueGlow">
                  {str(c.linkLabel)} <ArrowRight size={14} aria-hidden />
                </span>
              )}
            </>
          );
          const cls = `block h-full rounded-2xl border p-6 md:p-7 text-left transition-colors ${
            c.highlight ? 'border-stroxx-blue/60 bg-stroxx-blue/[0.06]' : 'border-line bg-carbon'
          } ${hasLink ? 'hover:border-stroxx-blue' : ''}`;
          return (
            <Reveal key={i} delay={(i % 3) * 90}>
              {hasLink ? (
                href && !/carl-ras\.dk/i.test(href) ? (
                  <a href={href} className={cls} {...(/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {body}
                  </a>
                ) : (
                  <DealerLink href={href} itemNumber={str(c.itemNumber)} className={`${cls} w-full`}>
                    {body}
                  </DealerLink>
                )
              ) : (
                <div className={cls}>{body}</div>
              )}
            </Reveal>
          );
        })}
      </div>
      {s.foot && <p className="mt-8 max-w-3xl text-sm leading-relaxed text-fog">{s.foot}</p>}
    </Wrap>
  );
}

/* ── rangeAdvisor ─────────────────────────────────────────────────────────── */
export function RangeAdvisorBlock({ s }: { s: LandingSection }) {
  const bands = list<Record<string, unknown>>(s.bands)
    .map((b) => ({ upTo: Number(b.upTo), result: str(b.result) }))
    .filter((b) => Number.isFinite(b.upTo) && b.result);
  if (!bands.length || !Number.isFinite(Number(s.min)) || !Number.isFinite(Number(s.max))) return null;
  return (
    <Wrap narrow>
      {(s.title || s.intro) && (
        <div className="mb-8 max-w-3xl">
          {s.title && <h3 className="h-display text-[clamp(1.8rem,3.4vw,2.8rem)] leading-tight text-white">{s.title}</h3>}
          {s.intro && <p className="mt-4 text-lg leading-relaxed text-fog">{s.intro}</p>}
        </div>
      )}
      <Reveal>
        <RangeAdvisor
          label={str(s.label)}
          unit={str(s.unit)}
          min={Number(s.min)}
          max={Number(s.max)}
          step={Number(s.step) || 1}
          initial={Number(s.defaultValue)}
          bands={bands}
          resultTemplate={str(s.resultTemplate)}
          valueLabel={str(s.valueLabel)}
          resultLabel={str(s.resultLabel)}
        />
      </Reveal>
    </Wrap>
  );
}

/* ── safetyNotice ─────────────────────────────────────────────────────────── */
export function SafetyNotice({ s }: { s: LandingSection }) {
  return (
    <section className="relative">
      <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
        <Reveal>
          <div role="note" className="relative overflow-hidden rounded-2xl border border-stroxx-red/50 bg-stroxx-red/[0.06] p-7 md:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(235,0,41,0.18), transparent)' }} />
            {s.eyebrow && <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-stroxx-red">{s.eyebrow}</div>}
            {s.headline && (
              <h2 className="h-display mb-5 max-w-3xl text-[clamp(1.8rem,4vw,3rem)] leading-[1] text-white">
                <Accent text={s.headline} />
              </h2>
            )}
            {s.body && <p className="max-w-3xl text-lg leading-relaxed text-white/85">{s.body}</p>}
            {s.sub && <p className="mt-4 max-w-3xl leading-relaxed text-fog">{s.sub}</p>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── stepList ─────────────────────────────────────────────────────────────── */
export function StepList({ s }: { s: LandingSection }) {
  const steps = list<Record<string, unknown>>(s.steps);
  if (!steps.length) return null;
  return (
    <Wrap>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Head eyebrow={s.eyebrow} headline={s.headline} intro={s.intro} className="mb-0" />
        </div>
        <ol className="grid list-none gap-0 p-0">
          {steps.map((st, i) => (
            <li key={i}>
              <Reveal delay={(i % 4) * 60}>
                <div className="flex gap-5 border-t border-line py-5">
                  <span className="h-display w-9 shrink-0 text-2xl leading-none text-stroxx-blueGlow">{String(i + 1).padStart(2, '0')}</span>
                  <p className="leading-relaxed text-fog">
                    <strong className="font-medium text-white">{str(st.lead)}</strong> {str(st.body)}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Wrap>
  );
}

/* ── imageMosaic ──────────────────────────────────────────────────────────── */
export function ImageMosaic({ s }: { s: LandingSection }) {
  const imgs = list<Record<string, unknown>>(s.images)
    .map((im) => ({ src: assetUrl(im, 1800), alt: alt(im) }))
    .filter((x): x is { src: string; alt: string } => Boolean(x.src));
  if (!imgs.length) return null;
  const gray = s.colour ? '' : 'grayscale';
  /* 2, 1, 2, 1 … : pairs with a wide one between them */
  const rows: { kind: 'duo' | 'wide'; items: typeof imgs }[] = [];
  let i = 0;
  let duo = true;
  while (i < imgs.length) {
    if (duo && imgs.length - i >= 2) {
      rows.push({ kind: 'duo', items: imgs.slice(i, i + 2) });
      i += 2;
    } else {
      rows.push({ kind: 'wide', items: imgs.slice(i, i + 1) });
      i += 1;
    }
    duo = !duo;
  }
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-[1600px] gap-4 px-6 py-16 md:gap-5 md:px-10 md:py-24">
        {rows.map((r, ri) =>
          r.kind === 'duo' ? (
            <div key={ri} className="grid gap-4 sm:grid-cols-2 md:gap-5">
              {r.items.map((im, k) => (
                <Reveal key={k} delay={k * 90}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.src} alt={im.alt} loading="lazy" className={`aspect-[4/5] w-full rounded-2xl object-cover ${gray}`} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal key={ri}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.items[0].src} alt={r.items[0].alt} loading="lazy" className={`aspect-[3/2] w-full rounded-2xl object-cover md:aspect-[21/9] ${gray}`} />
            </Reveal>
          ),
        )}
        {s.disclosure && <p className="text-xs uppercase tracking-wider text-fog/70">{s.disclosure}</p>}
      </div>
    </section>
  );
}

/* ── linkCards ────────────────────────────────────────────────────────────── */
function CardGrid({ cards, linkLabel, ctx }: { cards: Record<string, unknown>[]; linkLabel?: string; ctx: BlockCtx }) {
  return (
    /* no orphan last row: 3 and 6 cards → three across, 4 → four, 5 → five */
    <div className={`grid gap-3 sm:gap-4 grid-cols-2 ${cards.length % 3 === 0 ? 'lg:grid-cols-3' : cards.length === 4 || cards.length > 6 ? 'lg:grid-cols-4' : cards.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-3'}`}>
      {cards.map((c, i) => {
        const img = assetUrl(c.imageUpload, 700);
        const href = marketHref(c.href, ctx);
        const inner = (
          <>
            <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-steel">
              <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(55% 55% at 50% 55%, rgba(0,136,194,0.18), transparent 72%)' }} />
              {img && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={img} alt={alt(c.imageUpload) || str(c.title)} loading="lazy" className="absolute inset-[8%] h-[84%] w-[84%] object-contain transition-transform duration-500 group-hover:scale-[1.05]" />
              )}
              {str(c.badge) && <span className="absolute left-2.5 top-2.5 rounded-full bg-stroxx-blue px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">{str(c.badge)}</span>}
            </div>
            <div className="text-sm font-medium leading-snug text-white sm:text-base">{str(c.title)}</div>
            {str(c.body) && <p className="mt-1.5 text-sm leading-relaxed text-fog">{str(c.body)}</p>}
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm text-stroxx-blueGlow">
              {linkLabel} <ArrowRight size={14} aria-hidden />
            </span>
          </>
        );
        const cls = 'group flex h-full w-full flex-col rounded-2xl border border-line bg-carbon p-3 sm:p-4 text-left transition-colors hover:border-stroxx-blue/60';
        return (
          <Reveal key={i} delay={(i % 5) * 60}>
            {href && !/carl-ras\.dk/i.test(href) ? (
              <a href={href} className={cls} {...(/^https?:/i.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {inner}
              </a>
            ) : (
              <DealerLink href={href} itemNumber={str(c.itemNumber)} className={cls}>
                {inner}
              </DealerLink>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

export function LinkCards({ s, ctx }: { s: LandingSection; ctx: BlockCtx }) {
  const cards = list<Record<string, unknown>>(s.cards);
  const second = list<Record<string, unknown>>(s.secondCards);
  if (!cards.length && !second.length) return null;
  return (
    <Wrap>
      <Head eyebrow={s.eyebrow} headline={s.headline} intro={s.intro} />
      {cards.length > 0 && <CardGrid cards={cards} linkLabel={str(s.linkLabel)} ctx={ctx} />}
      {s.secondHeadline && second.length > 0 && (
        <>
          <h3 className="h-display mb-8 mt-16 text-[clamp(1.6rem,3.2vw,2.6rem)] leading-tight text-white">{s.secondHeadline}</h3>
          <CardGrid cards={second} linkLabel={str(s.linkLabel)} ctx={ctx} />
        </>
      )}
    </Wrap>
  );
}

/* ── explainer ────────────────────────────────────────────────────────────── */
/** Approximate sRGB of a black-body light source, for the Kelvin swatches. */
export function kelvinColour(k: number): string {
  const t = Math.min(40000, Math.max(1000, k)) / 100;
  let r: number;
  let g: number;
  let b: number;
  if (t <= 66) {
    r = 255;
    g = 99.47 * Math.log(t) - 161.12;
    b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04;
  } else {
    r = 329.7 * Math.pow(t - 60, -0.1332);
    g = 288.12 * Math.pow(t - 60, -0.0755);
    b = 255;
  }
  const c = (x: number) => Math.round(Math.min(255, Math.max(0, x)));
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

export function Explainer({ s, ctx }: { s: LandingSection; ctx: BlockCtx }) {
  const levels = list<Record<string, unknown>>(s.levels);
  const notes = list<Record<string, unknown>>(s.notes);
  const href = marketHref(s.ctaHref, ctx);
  const visual = str(s.visual) || 'none';
  return (
    <Wrap>
      <Head eyebrow={s.eyebrow} headline={s.headline} intro={s.intro} />
      {s.note && <p className="-mt-6 mb-10 max-w-3xl text-sm leading-relaxed text-fog/80">{s.note}</p>}

      {visual === 'levels' && levels.length > 0 && (
        <ol className="mb-12 grid list-none gap-0 p-0 md:grid-cols-4 md:gap-4">
          {levels.map((l, i) => (
            <li key={i}>
              <Reveal delay={i * 90}>
                <div className="relative h-full border-l-2 border-line py-4 pl-5 md:border-l-0 md:border-t-2 md:pl-0 md:pt-6" style={{ borderColor: `rgba(0,136,194,${0.35 + (0.65 * (i + 1)) / levels.length})` }}>
                  <div className="h-display mb-2 text-[clamp(1.6rem,3vw,2.4rem)] leading-none text-white">{str(l.value)}</div>
                  <p className="text-sm leading-relaxed text-fog">{str(l.body)}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      )}

      {visual === 'kelvin' && levels.length > 0 && (
        <Reveal>
          <div className="mb-12 overflow-hidden rounded-2xl border border-line">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {levels.map((l, i) => {
                const k = Number(l.kelvin) || 4000;
                const col = kelvinColour(k);
                return (
                  <div key={i} className="relative flex min-h-[220px] flex-col justify-end p-5 md:min-h-[280px]" style={{ background: `linear-gradient(180deg, ${col} 0%, rgba(11,12,14,0.92) 78%)` }}>
                    <div className="h-display text-2xl text-white md:text-3xl" style={{ textShadow: '0 1px 12px rgba(0,0,0,.5)' }}>{str(l.value)}</div>
                    <p className="mt-1 text-sm leading-snug text-white/85">{str(l.body)}</p>
                    {list<string>(l.chips).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {list<string>(l.chips).map((c, ci) => (
                          <span key={ci} className="rounded-full border border-white/25 bg-black/30 px-2 py-0.5 text-[11px] text-white">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {(s.axisLow || s.axisHigh) && (
              <div className="flex justify-between gap-4 border-t border-line bg-carbon px-5 py-3 text-xs text-fog">
                <span>← {s.axisLow}</span>
                <span className="text-right">{s.axisHigh} →</span>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {notes.length > 0 && (
        <div className={`grid gap-5 ${notes.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {notes.map((n, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="h-full rounded-2xl border border-line bg-carbon p-6">
                {str(n.title) && <div className="mb-2 font-medium text-white">{str(n.title)}</div>}
                {str(n.body) && <p className="text-sm leading-relaxed text-fog">{str(n.body)}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      )}
      {s.after && <p className="mt-8 max-w-3xl leading-relaxed text-fog">{s.after}</p>}
      {s.ctaLabel && href && (
        <div className="mt-8">
          <GlassButton href={href} external={/^https?:/i.test(href)} variant="ghost">
            {s.ctaLabel} <ArrowRight size={16} />
          </GlassButton>
        </div>
      )}
    </Wrap>
  );
}

/* ── peopleCards ──────────────────────────────────────────────────────────── */
export function PeopleCards({ s }: { s: LandingSection }) {
  const people = list<Record<string, unknown>>(s.people);
  if (!people.length) return null;
  return (
    <Wrap>
      <Head eyebrow={s.eyebrow} headline={s.headline} intro={s.intro} />
      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p, i) => {
          const photo = assetUrl(p.photo, 600);
          const phone = str(p.phone);
          const email = str(p.email);
          const tel = phone.replace(/[^\d+]/g, '');
          return (
            <li key={i}>
              <Reveal delay={(i % 3) * 70}>
                <div className="flex h-full gap-4 rounded-2xl border border-line bg-carbon p-5">
                  {photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={photo} alt={alt(p.photo) || str(p.name)} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover grayscale" />
                  ) : (
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-steel text-lg font-medium text-fog" aria-hidden>
                      {str(p.name).split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </div>
                  )}
                  <div className="min-w-0">
                    {str(p.location) && <div className="mb-1 text-[11px] uppercase tracking-wider text-stroxx-blueGlow">{str(p.location)}</div>}
                    <div className="font-medium text-white">{str(p.name)}</div>
                    {str(p.role) && <div className="text-sm text-fog">{str(p.role)}</div>}
                    {str(p.bio) && <p className="mt-2 text-sm leading-relaxed text-fog">{str(p.bio)}</p>}
                    <div className="mt-2 flex flex-col items-start text-sm">
                      {tel && <a href={`tel:${tel}`} className="inline-block py-1 text-white underline-offset-4 hover:text-stroxx-blueGlow hover:underline">{phone}</a>}
                      {email && <a href={`mailto:${email}`} className="inline-block break-all py-1 text-white underline-offset-4 hover:text-stroxx-blueGlow hover:underline">{email}</a>}
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Wrap>
  );
}
