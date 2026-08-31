import Link from 'next/link';
import Accent from '@/components/Accent';
import { ArrowRight } from 'lucide-react';
import type { LiveCampaign } from '@/lib/campaigns';

/** The slim promo row: campaigns a market has set to "Slim promo row" instead
 *  of the big band. It is how several campaigns coexist on one front page
 *  without a shouting match — one takes the cinematic band, the rest sit here
 *  as a compact, scannable row that still links to the full campaign page. */
export default function CampaignStrip({ campaigns }: { campaigns: LiveCampaign[] }) {
  if (!campaigns.length) return null;
  return (
    <section className="relative z-[46] border-y border-white/10 bg-ink" aria-label="Current campaigns">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-6 md:py-8">
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <li key={c._id ?? c.name}>
              <Link
                href={c.secondaryHref || '/try-it'}
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-white/25 hover:bg-white/[0.06]"
              >
                <div className="min-w-0 flex-1">
                  {c.eyebrow && <div className="eyebrow mb-1.5 text-[11px]">{c.eyebrow}</div>}
                  <div className="truncate text-sm text-white">
                    <Accent text={(c.headline || c.name || '').replace(/\n/g, ' ')} />
                  </div>
                  {c.endDate && (
                    <div className="mt-1 text-[12px] text-fog">
                      Runs until <time dateTime={c.endDate}>{c.endDate}</time>
                    </div>
                  )}
                </div>
                <ArrowRight size={16} className="shrink-0 text-stroxx-blue transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
