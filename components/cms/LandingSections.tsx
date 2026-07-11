import Link from 'next/link';
import Reveal from '@/components/Reveal';
import LandingBuyButton from '@/components/LandingBuyButton';
import Accent from '@/components/Accent';
import ScrollText from '@/components/ScrollText';
import GlassButton from '@/components/GlassButton';
import ProductCard from '@/components/ProductCard';
import GuaranteeModal from '@/components/GuaranteeModal';
import GuaranteeSeal from '@/components/GuaranteeSeal';
import VideoProof from '@/components/VideoProof';
import CountUp from '@/components/CountUp';
import Faq from '@/components/Faq';
import Testimonials from '@/components/Testimonials';
import { NewsletterForm } from '@/components/Newsletter';
import ContactForm from '@/components/ContactForm';
import BeforeAfter from '@/components/BeforeAfter';
import LogoMarquee from '@/components/LogoMarquee';
import EmbedFrame from '@/components/EmbedFrame';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { createDataAttribute } from 'next-sanity';
import { stegaClean } from '@sanity/client/stega';
import { productsBySkus, LandingSection, getVideos, getTestimonials } from '@/lib/cms';
import { cardCols, productCols, colsPlain } from '@/lib/grid';
import { projectId, dataset, studioUrl } from '@/sanity/env';
import { assetUrl } from '@/sanity/lib/image';
import type { Testimonial } from '@/lib/testimonials';
import type { Video } from '@/lib/videos';

/** Renders CMS landing-page sections with the exact art direction of the
 *  hand-built /try-it page. Each `_type` maps to one section block; editors
 *  reorder and refill, the code owns layout, motion and brand. */

/** alt text editors set on an uploaded image; empty for decorative images */
function imgAlt(img: unknown): string {
  const a = (img as { alt?: string } | null | undefined)?.alt;
  return typeof a === 'string' ? a : '';
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <div className="eyebrow mb-6">{children}</div>;
}

export { default as Accent } from '@/components/Accent';

export default async function LandingSections({
  sections,
  docId,
}: {
  sections: LandingSection[];
  docId?: string;
}) {
  /* collections some blocks render (CMS-managed with hardcoded fallbacks) */
  const [videosData, testimonialsData] = await Promise.all([getVideos(), getTestimonials()]);
  /* data-sanity on every section wrapper makes the WHOLE block click-to-edit
     in Presentation (headlines run through Accent/ScrollText, which split the
     invisible stega markers, so per-string overlays alone aren't enough). */
  const sectionAttr = (key: string) =>
    docId
      ? createDataAttribute({
          projectId,
          dataset,
          baseUrl: studioUrl,
          id: docId,
          type: 'landingPage',
          path: `sections[_key=="${key}"]`,
        }).toString()
      : undefined;

  return (
    <>
      {sections.map((s) => (
        <div key={s._key} data-sanity={sectionAttr(s._key)} style={{ display: 'contents' }}>
          {renderSection(s, videosData, testimonialsData)}
        </div>
      ))}
    </>
  );
}

function renderSection(s: LandingSection, videosData?: Video[], testimonialsData?: Testimonial[]) {
  switch (s._type) {
          case 'photoHero': {
            const height =
              s.height === 'half' ? 'h-[60svh] min-h-[420px]' : s.height === 'tall' ? 'h-[80svh] min-h-[520px]' : 'h-[100svh] min-h-[560px]';
            const align = s.align === 'center' ? 'center' : s.align === 'right' ? 'right' : 'left';
            const justify = align === 'center' ? 'lg:justify-center' : align === 'right' ? 'lg:justify-end' : '';
            const textAlign = align === 'center' ? 'lg:text-center' : align === 'right' ? 'lg:text-right' : '';
            const btnJustify = align === 'center' ? 'lg:justify-center' : align === 'right' ? 'lg:justify-end' : '';
            return (
              <section key={s._key} className={`relative ${height} overflow-hidden`}>
                {s.videoUrl ? (
                  <video
                    src={s.videoUrl}
                    poster={assetUrl(s.imageUpload) || s.image || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover select-none"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={assetUrl(s.imageUpload) || s.image || '/Images/campaign/rings.jpg'} sizes="100vw" alt={imgAlt(s.imageUpload)} draggable={false}
                    className="absolute inset-0 h-full w-full object-cover grayscale select-none" style={{ objectPosition: '62% 35%' }} />
                )}
                {align === 'left' && (
                  <div className="pointer-events-none absolute inset-0 hidden lg:block" style={{
                    background: 'linear-gradient(90deg, rgba(8,9,11,0.93) 0%, rgba(8,9,11,0.66) 34%, rgba(8,9,11,0.18) 62%, rgba(8,9,11,0) 82%)' }} />
                )}
                {align === 'right' && (
                  <div className="pointer-events-none absolute inset-0 hidden lg:block" style={{
                    background: 'linear-gradient(270deg, rgba(8,9,11,0.93) 0%, rgba(8,9,11,0.66) 34%, rgba(8,9,11,0.18) 62%, rgba(8,9,11,0) 82%)' }} />
                )}
                {align === 'center' && (
                  <div className="pointer-events-none absolute inset-0 hidden lg:block" style={{
                    background: 'radial-gradient(70% 70% at 50% 55%, rgba(8,9,11,0.78), rgba(8,9,11,0.25) 70%, rgba(8,9,11,0) 100%)' }} />
                )}
                <div className="pointer-events-none absolute inset-0 lg:hidden" style={{
                  background: 'linear-gradient(180deg, rgba(8,9,11,0.35) 0%, rgba(8,9,11,0) 30%, rgba(8,9,11,0.5) 55%, rgba(8,9,11,0.97) 100%)' }} />
                <div className="pointer-events-none absolute inset-0" style={{
                  background: 'linear-gradient(180deg, rgba(11,12,14,0.6) 0%, rgba(11,12,14,0) 18%, rgba(11,12,14,0) 80%, #0B0C0E 100%)' }} />
                <div className={`relative h-full mx-auto max-w-[1600px] px-6 md:px-10 flex items-end pb-14 lg:items-center lg:pb-0 ${justify}`}>
                  <div className={`max-w-2xl ${textAlign}`}>
                    <Eyebrow>{s.eyebrow}</Eyebrow>
                    <h1 className="h-display text-white text-[clamp(2.6rem,7vw,6rem)] leading-[0.92] mb-6">
                      <Accent text={s.headline} />
                    </h1>
                    <p className={`text-fog text-base md:text-xl leading-relaxed mb-8 max-w-lg ${align === 'center' ? 'lg:mx-auto' : align === 'right' ? 'lg:ml-auto' : ''}`}>
                      <Accent text={s.sub} />
                    </p>
                    <div className={`flex flex-wrap items-center gap-3 ${btnJustify}`}>
                      {s.ctaLabel && (
                        <LandingBuyButton ctaHref={s.ctaHref} label={s.ctaLabel} />
                      )}
                      {s.secondaryLabel && (
                        <a href={s.secondaryHref || '#section-1'} className="link-arrow text-sm">
                          {s.secondaryLabel} <ArrowDown size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          case 'splitMedia': {
            const imgLeft = s.imageSide === 'left';
            return (
              <section key={s._key} className="relative">
                <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36 grid gap-14 lg:grid-cols-2 lg:items-center">
                  <Reveal from={imgLeft ? 'left' : 'right'} className={imgLeft ? '' : 'lg:order-2'}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={assetUrl(s.imageUpload) || s.image || '/Images/campaign/tea.jpg'} alt={imgAlt(s.imageUpload)} draggable={false}
                        className="absolute inset-0 h-full w-full object-cover grayscale select-none" />
                      <div className="pointer-events-none absolute inset-0" style={{
                        background: 'linear-gradient(180deg, rgba(11,12,14,0) 55%, rgba(11,12,14,0.45) 100%)' }} />
                    </div>
                  </Reveal>
                  <Reveal delay={100} className={imgLeft ? 'lg:order-2' : ''}>
                    <Eyebrow>{s.eyebrow}</Eyebrow>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2rem,4.5vw,3.8rem)] leading-[0.95] mb-6" />
                    {s.body && <p className="text-fog text-lg leading-relaxed max-w-xl mb-8">{s.body}</p>}
                    {s.ctaLabel && (
                      <LandingBuyButton ctaHref={s.ctaHref} label={s.ctaLabel} />
                    )}
                  </Reveal>
                </div>
              </section>
            );
          }

          case 'featureGrid':
            return (
              <section key={s._key} className="relative">
                <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
                  {(s.eyebrow || s.headline) && (
                    <div className="max-w-3xl mb-12">
                      <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                      {s.headline && (
                        <ScrollText as="h2" text={s.headline}
                          className="h-display text-white text-[clamp(2rem,4.5vw,3.8rem)] leading-[0.95]" />
                      )}
                    </div>
                  )}
                  <div className={`grid gap-5 ${cardCols((s.items || []).length)}`}>
                    {((s.items || []) as { title?: string; body?: string }[]).map((f, i) => (
                      <Reveal key={i} delay={(i % 3) * 90}>
                        <div className="glass glass-card glass-panel rounded-xl p-7 h-full">
                          <div className="flex gap-1 mb-5">
                            {Array.from({ length: 3 }).map((_, k) => <span key={k} className="h-1.5 w-1.5 rounded-full bg-stroxx-blue" />)}
                          </div>
                          <div className="text-white font-medium text-lg mb-2">{f.title}</div>
                          <p className="text-fog text-sm leading-relaxed">{f.body}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'quote':
            return (
              <section key={s._key} className="relative">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,136,194,0.08), transparent 70%)' }} />
                <div className="relative mx-auto max-w-4xl px-6 md:px-10 py-24 md:py-36 text-center">
                  <Reveal>
                    <div className="flex justify-center gap-1.5 mb-8">
                      {Array.from({ length: 3 }).map((_, k) => <span key={k} className="h-2 w-2 rounded-full bg-stroxx-blue" />)}
                    </div>
                    <blockquote className="h-display text-white text-[clamp(1.6rem,3.6vw,3rem)] leading-[1.15] mb-8">
                      “{s.text}”
                    </blockquote>
                    {(s.attribution || s.role) && (
                      <div className="text-fog text-sm">
                        <span className="text-white">{s.attribution}</span>
                        {s.role ? ` · ${s.role}` : ''}
                      </div>
                    )}
                  </Reveal>
                </div>
              </section>
            );

          case 'ctaBanner': {
            const sHref = s.secondaryHref || '/stores';
            return (
              <section key={s._key} className="relative">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 55% at 50% 50%, rgba(0,136,194,0.14), transparent 70%)' }} />
                <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36 text-center">
                  <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                  <ScrollText as="h2" text={s.headline || ''}
                    className="h-display text-white text-[clamp(2.2rem,5.5vw,4.8rem)] leading-[0.94] mb-6" />
                  {s.sub && (
                    <Reveal delay={100}>
                      <p className="text-fog text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-9"><Accent text={s.sub} /></p>
                    </Reveal>
                  )}
                  <Reveal delay={160}>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {s.primaryLabel && (
                        <LandingBuyButton ctaHref={s.primaryHref} label={s.primaryLabel} />
                      )}
                      {s.secondaryLabel && (
                        <GlassButton href={sHref} external={/^https?:/i.test(sHref)} variant="ghost">{s.secondaryLabel}</GlassButton>
                      )}
                    </div>
                  </Reveal>
                </div>
              </section>
            );
          }

          case 'newsletter':
            return (
              <section key={s._key} className="relative">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(50% 60% at 50% 50%, rgba(0,136,194,0.10), transparent 70%)' }} />
                <div className="relative mx-auto max-w-2xl px-6 md:px-10 py-24 md:py-32 text-center">
                  <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                  <ScrollText as="h2" text={s.headline || ''}
                    className="h-display text-white text-[clamp(2rem,4.5vw,3.6rem)] leading-[0.95] mb-4" />
                  {s.sub && (
                    <Reveal delay={80}>
                      <p className="text-fog text-lg leading-relaxed mb-8">{s.sub}</p>
                    </Reveal>
                  )}
                  <Reveal delay={140}>
                    <NewsletterForm
                      center
                      copy={{
                        headline: s.headline || '',
                        text: s.sub || '',
                        buttonLabel: s.buttonLabel || 'Sign up',
                        disclaimer: s.disclaimer || 'Unsubscribe anytime.',
                      }}
                    />
                  </Reveal>
                </div>
              </section>
            );

          case 'contactForm':
            return (
              <section key={s._key} className="relative">
                <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32 grid gap-12 lg:grid-cols-2 lg:items-start">
                  <div>
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2rem,4.5vw,3.6rem)] leading-[0.95] mb-4" />
                    {s.sub && (
                      <Reveal delay={80}>
                        <p className="text-fog text-lg leading-relaxed max-w-md"><Accent text={s.sub} /></p>
                      </Reveal>
                    )}
                  </div>
                  <Reveal delay={120}>
                    <ContactForm topic={s.topic} buttonLabel={s.buttonLabel} successMessage={s.successMessage} />
                  </Reveal>
                </div>
              </section>
            );

          case 'beforeAfter':
            return (
              <section key={s._key} className="relative">
                <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
                  <div className="mb-10 max-w-3xl">
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2rem,4.5vw,3.8rem)] leading-[0.95] mb-4" />
                    {s.sub && <Reveal delay={80}><p className="text-fog text-lg leading-relaxed max-w-xl">{s.sub}</p></Reveal>}
                  </div>
                  <Reveal delay={120}>
                    <div className="mx-auto max-w-5xl">
                      <BeforeAfter
                        before={assetUrl(s.beforeUpload, 1600) || s.beforeImage || '/Images/campaign/rings.jpg'}
                        after={assetUrl(s.afterUpload, 1600) || s.afterImage || '/Images/campaign/tea.jpg'}
                        beforeAlt={imgAlt(s.beforeUpload)}
                        afterAlt={imgAlt(s.afterUpload)}
                        beforeLabel={s.beforeLabel || 'Before'}
                        afterLabel={s.afterLabel || 'After'}
                      />
                    </div>
                  </Reveal>
                </div>
              </section>
            );

          case 'storyCards': {
            const cards = (s.cards || []) as { title?: string; body?: string; imageUpload?: unknown; image?: string }[];
            return (
              <section key={s._key} className="relative">
                <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
                  <div className="mb-14 max-w-3xl">
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.95]" />
                  </div>
                  <div className="mx-auto max-w-4xl">
                    {cards.map((c, i) => {
                      const img = assetUrl(c.imageUpload, 1200) || c.image;
                      return (
                        /* solid card background on purpose: the stack covers
                           earlier cards, and backdrop blur on big sticky
                           layers is the iOS white-box pattern */
                        <div
                          key={i}
                          className="sticky mb-8 overflow-hidden rounded-2xl border border-line bg-carbon"
                          style={{ top: 96 + i * 18 }}
                        >
                          <div className={`grid ${img ? 'md:grid-cols-2' : ''}`}>
                            <div className="p-8 md:p-12">
                              <div className="text-stroxx-blue text-xs uppercase tracking-wider mb-4">
                                {String(i + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
                              </div>
                              <div className="h-display text-white text-2xl md:text-4xl mb-4">{c.title}</div>
                              <p className="text-fog text-base md:text-lg leading-relaxed max-w-md">{c.body}</p>
                            </div>
                            {img && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={img} alt={imgAlt(c.imageUpload)} loading="lazy"
                                className="h-56 w-full object-cover grayscale md:h-full" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }

          case 'logoMarquee': {
            const logos = ((s.logos || []) as { name?: string; logoUpload?: unknown; image?: string; href?: string }[])
              .filter((l) => l.name)
              .map((l) => ({ name: l.name as string, img: assetUrl(l.logoUpload, 300) || l.image || undefined, href: l.href }));
            return (
              <section key={s._key} className="relative py-16 md:py-24">
                {s.eyebrow && (
                  <div className="mx-auto max-w-[1600px] px-6 md:px-10 mb-8 text-center">
                    <Reveal><div className="eyebrow !mb-0 inline-block">{s.eyebrow}</div></Reveal>
                  </div>
                )}
                <LogoMarquee logos={logos} />
              </section>
            );
          }

          case 'embed':
            return (
              <section key={s._key} className="relative">
                <div className="mx-auto max-w-3xl px-6 md:px-10 py-24 md:py-32">
                  <div className="mb-10">
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    {s.headline && (
                      <ScrollText as="h2" text={s.headline}
                        className="h-display text-white text-[clamp(2rem,4.5vw,3.6rem)] leading-[0.95] mb-4" />
                    )}
                    {s.sub && <Reveal delay={80}><p className="text-fog text-lg leading-relaxed">{s.sub}</p></Reveal>}
                  </div>
                  <Reveal delay={120}>
                    {s.url ? (
                      /* stegaClean: draft-mode marker chars inside the URL
                         would fail new URL() and the allowlist check */
                      <EmbedFrame url={stegaClean(s.url) || s.url} height={s.height} title={stegaClean(s.headline) || undefined} />
                    ) : (
                      <div className="rounded-xl border border-line bg-ink/50 p-8 text-center">
                        <p className="text-fog text-sm">Paste the provider&apos;s https:// address in the block to load the embed.</p>
                      </div>
                    )}
                  </Reveal>
                </div>
              </section>
            );

          case 'spacer':
            return <div key={s._key} aria-hidden className={s.size === 's' ? 'h-12 md:h-16' : s.size === 'l' ? 'h-32 md:h-48' : 'h-20 md:h-28'} />;

          case 'statement': {
            const right = s.align === 'right';
            return (
              <section key={s._key} id="section-1" className="relative scroll-mt-24">
                {right && (
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 30% 50%, rgba(0,136,194,0.07), transparent 70%)' }} />
                )}
                <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36">
                  <div className={`max-w-4xl ${right ? 'lg:ml-auto lg:text-right' : ''}`}>
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2.2rem,5.5vw,4.6rem)] leading-[0.96] mb-10" />
                    {(s.paragraphs || []).map((p: string, i: number) => (
                      <Reveal key={i} delay={100 + i * 80}>
                        <p className={`${i === (s.paragraphs?.length ?? 0) - 1 && (s.paragraphs?.length ?? 0) > 1 ? 'text-white' : 'text-fog'} text-lg md:text-xl leading-relaxed max-w-2xl ${right ? 'lg:ml-auto' : ''} mb-6`}>
                          {p}
                        </p>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          case 'reframe':
            return (
              <section key={s._key} className="relative">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 50% 50%, rgba(0,136,194,0.10), transparent 70%)' }} />
                <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36 grid gap-14 lg:grid-cols-2 lg:items-center">
                  <div>
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96] mb-8" />
                    {(s.paragraphs || []).map((p: string, i: number) => (
                      <Reveal key={i} delay={100 + i * 80}>
                        <p className={`${i === (s.paragraphs?.length ?? 0) - 1 && (s.paragraphs?.length ?? 0) > 1 ? 'text-white' : 'text-fog'} text-lg leading-relaxed max-w-xl mb-6`}>
                          {p}
                        </p>
                      </Reveal>
                    ))}
                  </div>
                  {!!s.stats?.length && (
                    <Reveal delay={140} from="right">
                      <div className={`grid ${colsPlain(s.stats.length)} gap-6 lg:gap-8`}>
                        {s.stats.map((st: { value?: number; suffix?: string; label?: string }, i: number) => (
                          <div key={i} className="text-center lg:text-left">
                            <CountUp value={st.value ?? 0} suffix={st.suffix || ''}
                              className="h-display text-white text-[clamp(2rem,4.5vw,3.6rem)] leading-none mb-2 block" />
                            <div className="text-fog text-xs md:text-sm leading-snug">{st.label}</div>
                          </div>
                        ))}
                      </div>
                    </Reveal>
                  )}
                </div>
              </section>
            );

          case 'productProof': {
            const proof = productsBySkus(s.skus);
            return (
              <section key={s._key} className="relative">
                <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36">
                  <div className="max-w-3xl mb-12">
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96] mb-6" />
                    {s.sub && (
                      <Reveal delay={100}>
                        <p className="text-fog text-lg leading-relaxed max-w-xl">{s.sub}</p>
                      </Reveal>
                    )}
                  </div>
                  <div className={`grid gap-5 grid-cols-2 ${productCols(proof.length)}`}>
                    {proof.map((p, i) => (
                      <Reveal key={p.slug} delay={(i % 4) * 80}><ProductCard product={p} /></Reveal>
                    ))}
                  </div>
                  <Reveal delay={120}>
                    <div className="mt-10">
                      <Link href="/products" className="link-arrow">
                        See all the products <ArrowRight size={16} strokeWidth={2} />
                      </Link>
                    </div>
                  </Reveal>
                </div>
              </section>
            );
          }

          case 'videoProof': {
            // Editor-picked films (dereferenced in getLandingPage) win; empty
            // selection falls back to all active films.
            const picked = (Array.isArray(s.films) ? s.films : [])
              .filter((f: { youtubeId?: string }) => f?.youtubeId)
              .map((f: { youtubeId?: string; title?: string; by?: string }): Video => ({
                id: stegaClean(f.youtubeId) ?? (f.youtubeId as string),
                title: stegaClean(f.title) ?? f.title ?? '',
                by: stegaClean(f.by) ?? f.by ?? '',
              }));
            const vids = picked.length ? picked : videosData;
            return (
              <section key={s._key} className="relative">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 45% at 50% 40%, rgba(0,136,194,0.08), transparent 70%)' }} />
                <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-36">
                  <div className="max-w-3xl mb-12">
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96] mb-6" />
                    {s.sub && (
                      <Reveal delay={100}>
                        <p className="text-fog text-lg leading-relaxed max-w-xl">{s.sub}</p>
                      </Reveal>
                    )}
                  </div>
                  <Reveal delay={140}>
                    <div className="max-w-5xl"><VideoProof videos={vids} /></div>
                  </Reveal>
                </div>
              </section>
            );
          }

          case 'testimonialProof':
            return (
              <section key={s._key} className="relative">
                <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
                  <div className="max-w-3xl mb-12">
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.96]" />
                  </div>
                  <Testimonials items={testimonialsData ?? []} />
                </div>
              </section>
            );

          case 'photoBreak':
            return (
              <section key={s._key} className="relative h-[88svh] min-h-[520px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetUrl(s.imageUpload) || s.image || '/Images/campaign/tea.jpg'} sizes="100vw" alt={imgAlt(s.imageUpload)} draggable={false}
                  className="absolute inset-0 h-full w-full object-cover grayscale select-none" style={{ objectPosition: '66% 40%' }} />
                <div className="pointer-events-none absolute inset-0" style={{
                  background: 'linear-gradient(180deg, #0B0C0E 0%, rgba(11,12,14,0) 22%, rgba(11,12,14,0.25) 60%, #0B0C0E 100%)' }} />
                <div className="relative h-full mx-auto max-w-[1600px] px-6 md:px-10 flex items-end pb-14">
                  <Reveal>
                    <div className="eyebrow mb-4">{s.eyebrow}</div>
                    <h3 className="h-display text-white text-[clamp(1.9rem,4.5vw,3.6rem)] leading-[0.96] mb-3">
                      <Accent text={s.headline} />
                    </h3>
                    <p className="text-fog text-base md:text-lg max-w-md"><Accent text={s.sub} /></p>
                  </Reveal>
                </div>
              </section>
            );

          case 'guaranteeAsk':
            return (
              <section key={s._key} className="relative">
                <div className="absolute inset-0" style={{ background: 'radial-gradient(55% 55% at 50% 45%, rgba(0,136,194,0.13), transparent 70%)' }} />
                <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-28 md:py-44">
                  <div className="text-center mb-14 md:mb-20">
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2.6rem,7vw,6rem)] leading-[0.92] mb-8" />
                    {s.sub && (
                      <Reveal delay={120}>
                        <p className="text-fog text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"><Accent text={s.sub} /></p>
                      </Reveal>
                    )}
                  </div>
                  {!!s.steps?.length && (
                    <div className={`grid gap-5 ${cardCols(s.steps.length)} max-w-5xl mx-auto mb-14 md:mb-16`}>
                      {s.steps.map((st: { title?: string; body?: string }, i: number) => (
                        <Reveal key={i} delay={i * 90}>
                          <div className="glass glass-card rounded-xl p-7 h-full">
                            <div className="h-display text-stroxx-blue text-3xl mb-4">{String(i + 1).padStart(2, '0')}</div>
                            <div className="text-white font-medium mb-2">{st.title}</div>
                            <p className="text-fog text-sm leading-relaxed">{st.body}</p>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  )}
                  <Reveal delay={200}>
                    <div className="text-center">
                      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                        {s.ctaLabel && (
                          <LandingBuyButton ctaHref={s.ctaHref} label={s.ctaLabel} />
                        )}
                        {s.secondaryLabel && (
                          <GlassButton href={s.secondaryHref || '/stores'} external={/^https?:/i.test(s.secondaryHref || '')} variant="ghost">
                            {s.secondaryLabel}
                          </GlassButton>
                        )}
                      </div>
                      <GuaranteeModal />
                    </div>
                  </Reveal>
                </div>
              </section>
            );

          case 'guaranteeSeal':
            return (
              <section key={s._key} className="relative">
                <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32 flex justify-center">
                  <GuaranteeSeal
                    line1={s.line1}
                    connector={s.connector}
                    line2={s.line2}
                    subLine1={s.subLine1}
                    subLine2={s.subLine2}
                    tilt={typeof s.tilt === 'number' ? s.tilt : undefined}
                    peelDepth={typeof s.peelDepth === 'number' ? s.peelDepth : undefined}
                  />
                </div>
              </section>
            );

          case 'faqSection': {
            const items = ((s.items || []) as { q?: string; a?: string }[]).map((f) => ({ q: f.q || '', a: f.a || '' }));
            return (
              <section key={s._key} className="relative">
                <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
                  <div className="text-center mb-12">
                    <Reveal><Eyebrow>{s.eyebrow}</Eyebrow></Reveal>
                    <ScrollText as="h2" text={s.headline || ''}
                      className="h-display text-white text-[clamp(2rem,4.5vw,3.6rem)] leading-[0.96]" />
                  </div>
                  <Reveal delay={100}>
                    <Faq items={items} />
                  </Reveal>
                </div>
              </section>
            );
          }

          default:
            return null;
  }
}
