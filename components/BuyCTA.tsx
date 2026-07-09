'use client';
import { ArrowRight } from 'lucide-react';
import GlassButton from '@/components/GlassButton';
import { useDealerChooser } from '@/components/DealerChooser';
import { dealerBuyUrl } from '@/lib/buy';

/** Market-first buy CTA. Resolves the current market's dealer: a single-dealer
 *  market links straight to that dealer (Denmark → Carl Ras product deep-link,
 *  others → their storefront); the international market (no single dealer) opens
 *  the dealer chooser. Label defaults to "Buy at <dealer>" / "Where to buy";
 *  pass `label` to override (e.g. "Buy" on product cards). */
export default function BuyCTA({
  code, href, label, arrow = false, variant, size, className = '',
}: {
  code?: string;
  href?: string;
  label?: string;
  arrow?: boolean;
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { currentDealer, open } = useDealerChooser();
  const url = href ?? dealerBuyUrl(currentDealer, code);
  const text = label ?? (currentDealer ? `Buy at ${currentDealer.dealerName}` : 'Where to buy');
  const inner = (
    <>
      <span>{text}</span>
      {arrow && <ArrowRight size={16} strokeWidth={2} className="shrink-0" />}
    </>
  );
  if (!url) {
    return <GlassButton onClick={open} variant={variant} size={size} className={className}>{inner}</GlassButton>;
  }
  return <GlassButton href={url} external variant={variant} size={size} className={className}>{inner}</GlassButton>;
}
