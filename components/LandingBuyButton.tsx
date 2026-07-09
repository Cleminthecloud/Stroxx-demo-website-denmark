'use client';
import { ArrowRight } from 'lucide-react';
import GlassButton from '@/components/GlassButton';
import { useDealerChooser } from '@/components/DealerChooser';
import { dealerBuyUrl } from '@/lib/buy';

/** Buy CTA inside CMS landing sections. Honors an editor-chosen destination
 *  (`ctaHref`) when set; otherwise resolves the current market's dealer, the
 *  international market opens the chooser. `buy` is a last-resort fallback. */
export default function LandingBuyButton({
  ctaHref, buy, label,
}: { ctaHref?: string; buy: string; label: string }) {
  const { currentDealer, open } = useDealerChooser();
  const explicit = typeof ctaHref === 'string' && ctaHref.trim().length > 0;
  const dealerUrl = dealerBuyUrl(currentDealer);
  if (!explicit && !dealerUrl) {
    return (
      <GlassButton onClick={open}>
        <span>{label || 'Where to buy'}</span> <ArrowRight size={16} />
      </GlassButton>
    );
  }
  const href = explicit ? (ctaHref as string).trim() : (dealerUrl || buy);
  return (
    <GlassButton href={href} external={/^https?:/i.test(href)}>
      <span>{label}</span> <ArrowRight size={16} />
    </GlassButton>
  );
}
