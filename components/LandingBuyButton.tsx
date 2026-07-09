'use client';
import { ArrowRight } from 'lucide-react';
import GlassButton from '@/components/GlassButton';
import { useDealerChooser } from '@/components/DealerChooser';

/** Buy CTA inside CMS landing sections. Honors an editor-chosen destination
 *  (`ctaHref`) when set; otherwise the buy is market-derived — on the
 *  international market (no single dealer) it opens the dealer chooser instead
 *  of falling back to the Carl Ras brand link. `buy` is the single-dealer
 *  fallback URL. */
export default function LandingBuyButton({
  ctaHref,
  buy,
  label,
}: {
  ctaHref?: string;
  buy: string;
  label: string;
}) {
  const { international, open } = useDealerChooser();
  const explicit = typeof ctaHref === 'string' && ctaHref.trim().length > 0;
  if (!explicit && international) {
    return (
      <GlassButton onClick={open}>
        <span>Where to buy</span> <ArrowRight size={16} />
      </GlassButton>
    );
  }
  const href = explicit ? (ctaHref as string) : buy;
  return (
    <GlassButton href={href} external={/^https?:/i.test(href)}>
      <span>{label}</span> <ArrowRight size={16} />
    </GlassButton>
  );
}
