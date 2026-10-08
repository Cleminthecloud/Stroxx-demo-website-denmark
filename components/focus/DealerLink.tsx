'use client';
import { useDealerChooser } from '@/components/DealerChooser';
import { dealerBuyUrl } from '@/lib/buy';
import { isForeignDealerUrl, safeHref } from '@/lib/focus';

/** A link that respects the buy-layer contract (lib/buy.ts) on CMS content:
 *  - an editor's link is used as is, UNLESS it points at another market's
 *    dealer shop (a carl-ras.dk link seen from Germany or the international
 *    site), which is never shown;
 *  - otherwise the product item number resolves to the visitor's own dealer;
 *  - with no dealer at all (international) the dealer chooser opens.
 *  Renders a real <a> whenever there is a destination, a <button> otherwise. */
export default function DealerLink({
  href,
  itemNumber,
  className,
  children,
  ariaLabel,
}: {
  href?: string;
  itemNumber?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const { currentDealer, open } = useDealerChooser();
  const explicit = safeHref(href);
  const usable = explicit && !isForeignDealerUrl(explicit, currentDealer?.code) ? explicit : '';
  const target = usable || dealerBuyUrl(currentDealer, itemNumber?.trim() || undefined) || '';
  if (!target) {
    return (
      <button type="button" onClick={open} className={className} aria-label={ariaLabel}>
        {children}
      </button>
    );
  }
  const external = /^https?:/i.test(target);
  return (
    <a
      href={target}
      className={className}
      aria-label={ariaLabel}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}
