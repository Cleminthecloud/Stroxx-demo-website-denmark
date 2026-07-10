import Reveal from '@/components/Reveal';
import { Phone, ArrowUpRight } from 'lucide-react';
import type { Market } from '@/lib/markets';
import DealerMark from '@/components/DealerMark';
import { dealerLogoByCode } from '@/lib/dealer-logos';

/** International "where to buy" directory. The international page (stroxx.eu)
 *  has no single dealer, so instead of a "Buy at <dealer>" button it lists
 *  every market's dealer with their contact details, sourced straight from the
 *  market documents (getMarkets). A market appears here automatically once its
 *  dealer is filled in, no code change. Selling and service are the dealer's
 *  job, so the customer is routed to them, not to STROXX.
 *  See docs/STROXX-market-localisation-plan.md. */
export default function WhereToBuy({
  dealers,
  eyebrow = 'Where to buy',
  headline = 'Buy from your local STROXX dealer.',
  intro = 'STROXX is sold through a trusted distributor in each market. Pick yours below, they handle orders, delivery and service in your language.',
}: {
  dealers: Market[];
  eyebrow?: string;
  headline?: string;
  intro?: string;
}) {
  if (!dealers.length) return null;
  return (
    <section id="where-to-buy" className="relative scroll-mt-24">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(55% 55% at 50% 38%, rgba(0,136,194,0.10), transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-28 md:py-36">
        <div className="max-w-3xl mb-14">
          <div className="eyebrow mb-7">{eyebrow}</div>
          <h2 className="h-display text-white text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.95] mb-6">{headline}</h2>
          {intro && <p className="text-fog text-lg leading-relaxed max-w-xl">{intro}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dealers.map((m, i) => (
            <Reveal key={m._id ?? m.code} delay={(i % 4) * 70}>
              <div className="glass-panel glass-panel--glow flex h-full flex-col rounded-2xl p-6">
                <div className="text-fog/60 text-xs uppercase tracking-wider mb-2">{m.name}</div>
                <div className="mb-6">
                  {dealerLogoByCode(m.code) ? (
                    m.dealerCtaUrl ? (
                      <a
                        href={m.dealerCtaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit ${m.dealerName}`}
                        className="inline-block text-white transition-opacity hover:opacity-80"
                      >
                        <DealerMark src={dealerLogoByCode(m.code)!.src} ar={dealerLogoByCode(m.code)!.ar} label={m.dealerName} height={32} />
                      </a>
                    ) : (
                      <DealerMark src={dealerLogoByCode(m.code)!.src} ar={dealerLogoByCode(m.code)!.ar} label={m.dealerName} height={32} className="text-white" />
                    )
                  ) : (
                    <div className="h-display text-white text-[1.7rem] leading-tight">{m.dealerName}</div>
                  )}
                </div>
                <div className="mt-auto space-y-3">
                  {m.supportPhone && (
                    <a
                      href={`tel:${m.supportPhone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-2 text-fog hover:text-white transition-colors text-sm"
                    >
                      <Phone size={14} strokeWidth={2} className="text-stroxx-blue shrink-0" />
                      {m.supportPhone}
                    </a>
                  )}
                  {m.supportHours && <div className="text-fog/50 text-xs leading-relaxed">{m.supportHours}</div>}
                  {m.dealerCtaUrl && (
                    <a
                      href={m.dealerCtaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-arrow inline-flex items-center gap-1.5 text-sm pt-1"
                    >
                      Visit {m.dealerName}
                      <ArrowUpRight size={15} strokeWidth={2} />
                    </a>
                  )}
                  {!m.supportPhone && !m.dealerCtaUrl && (
                    <div className="text-fog/40 text-xs">Contact details coming soon.</div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
