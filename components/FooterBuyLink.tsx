'use client';
import { useDealerChooser } from '@/components/DealerChooser';
import { CR_BRAND, UTM } from '@/lib/data';

/** Footer "Buy" link, market-aware. International (no single dealer) opens the
 *  dealer chooser instead of dead-ending on Carl Ras; single-dealer markets
 *  link straight to the dealer. Styled to match FooterLink. */
export default function FooterBuyLink() {
  const { international, open } = useDealerChooser();
  if (international) {
    return (
      <button type="button" onClick={open} className="block text-left text-fog hover:text-white">
        Where to buy
      </button>
    );
  }
  return (
    <a href={`${CR_BRAND}/?${UTM}`} target="_blank" rel="noopener noreferrer" className="block text-fog hover:text-white">
      Buy STROXX
    </a>
  );
}
