'use client';
import { useDealerChooser } from '@/components/DealerChooser';
import { dealerBuyUrl } from '@/lib/buy';

/** Footer "Buy" link, market-first: single-dealer markets link to their dealer,
 *  the international market opens the dealer chooser. Styled like FooterLink. */
export default function FooterBuyLink() {
  const { currentDealer, open } = useDealerChooser();
  const url = dealerBuyUrl(currentDealer);
  if (!url) {
    return (
      <button type="button" onClick={open} className="block text-left text-fog hover:text-white">
        Where to buy
      </button>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block text-fog hover:text-white">
      Buy STROXX
    </a>
  );
}
