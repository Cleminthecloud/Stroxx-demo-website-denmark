'use client';
import { ArrowRight } from 'lucide-react';
import GlassButton from '@/components/GlassButton';
import { useDealerChooser } from '@/components/DealerChooser';
import { dealerBuyUrl } from '@/lib/buy';

/** Buy CTA inside CMS landing sections. Honors an editor-chosen destination
 *  (`ctaHref`); otherwise resolves the current market's dealer, and the
 *  international market (no single dealer) opens the dealer chooser. */
export default function LandingBuyButton({
  ctaHref,
  label,
}: {
  ctaHref?: string;
  label: string;
}) {
  const { currentDealer, open } = useDealerChooser();
  const explicit = typeof ctaHref === 'string' && ctaHref.trim().length > 0 ? ctaHref.trim() : '';
  const dealerUrl = dealerBuyUrl(currentDealer);
  if (!explicit && !dealerUrl) {
    return (
      <GlassButton onClick={open}>
        <span>{label || 'Where to buy'}</span> <ArrowRight size={16} />
      </GlassButton>
    );
  }
  const href = explicit || (dealerUrl as string);
  return (
    <GlassButton href={href} external={/^https?:/i.test(href)}>
      <span>{label}</span> <ArrowRight size={16} />
    </GlassButton>
  );
}
