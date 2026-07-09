'use client';
import { ArrowRight } from 'lucide-react';
import GlassButton from '@/components/GlassButton';
import { productBuyUrl, CR_BRAND, UTM } from '@/lib/data';
import { useDealerChooser } from '@/components/DealerChooser';

/** Market-aware buy CTA. On single-dealer markets it links straight to the
 *  dealer (a product deep-link when we have a `code`, else the brand href). On
 *  the international market (no single dealer) it opens the shared dealer
 *  chooser instead of dead-ending on Carl Ras. Replaces the old hard-coded
 *  productBuyUrl / "Buy at Carl Ras" links everywhere a customer can buy. */
export default function BuyCTA({
  code,
  href,
  label = 'Buy',
  intlLabel,
  arrow = false,
  variant,
  size,
  className = '',
}: {
  /** product code → dealer deep-link (single-dealer markets) */
  code?: string;
  /** explicit non-product href (e.g. brand home); ignored when international */
  href?: string;
  /** label on single-dealer markets */
  label?: string;
  /** label on the international market; defaults to `label` */
  intlLabel?: string;
  arrow?: boolean;
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { international, open } = useDealerChooser();
  const text = international ? (intlLabel ?? label) : label;
  const inner = (
    <>
      <span>{text}</span>
      {arrow && <ArrowRight size={16} strokeWidth={2} className="shrink-0" />}
    </>
  );

  if (international) {
    return (
      <GlassButton onClick={open} variant={variant} size={size} className={className}>
        {inner}
      </GlassButton>
    );
  }

  const url = href ?? (code ? productBuyUrl(code) : `${CR_BRAND}/?${UTM}`);
  return (
    <GlassButton href={url} external variant={variant} size={size} className={className}>
      {inner}
    </GlassButton>
  );
}
