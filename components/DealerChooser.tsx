'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Phone, ArrowUpRight, X } from 'lucide-react';
import type { Market } from '@/lib/markets';

const DEALER_LOGO: Record<string, string> = {
  dk: '/brand/partners/carl-ras.svg',
  de: '/brand/partners/meesenburg.svg',
  fr: '/brand/partners/foussier.svg',
  be: '/brand/partners/lecot.svg',
};

/** Shared dealer-chooser overlay for the international (stroxx.eu) experience.
 *  There is no single international dealer, so a product "Buy" doesn't link to
 *  one shop, it opens this picker listing every market's distributor (name,
 *  phone, hours, site) sourced from the market documents (getMarkets), the same
 *  data the homepage WhereToBuy section uses. Selling + service are the dealer's
 *  job, so we route the customer to them. On single-dealer markets the provider
 *  is created with international=false and BuyCTA links straight to the dealer
 *  instead of opening this. See docs/STROXX-market-localisation-plan.md. */
type Ctx = {
  currentDealer: Market | null;
  dealers: Market[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const DealerChooserContext = createContext<Ctx>({
  currentDealer: null,
  dealers: [],
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function useDealerChooser() {
  return useContext(DealerChooserContext);
}

export default function DealerChooserProvider({
  currentDealer,
  dealers,
  children,
}: {
  currentDealer: Market | null;
  dealers: Market[];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [isOpen, close]);

  return (
    <DealerChooserContext.Provider value={{ currentDealer, dealers, isOpen, open, close }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Where to buy"
          onClick={close}
        >
          <div
            className="relative my-8 w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0d0f12]/95 p-6 shadow-2xl sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-fog transition-colors hover:text-white"
            >
              <X size={20} strokeWidth={2} />
            </button>
            <div className="eyebrow mb-4">Where to buy</div>
            <h2 className="h-display mb-3 text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-white">
              Buy from your local STROXX dealer.
            </h2>
            <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-fog">
              STROXX is sold through a trusted distributor in each market. Pick yours below, they
              handle orders, delivery and service in your language.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {dealers.map((m) => (
                <div key={m._id ?? m.code} className="glass-panel glass-panel--glow flex h-full flex-col rounded-2xl p-6">
                  <div className="mb-2 text-xs uppercase tracking-wider text-fog/60">{m.name}</div>
                  {m.code && DEALER_LOGO[m.code] ? (
                    <div
                      role="img"
                      aria-label={m.dealerName}
                      className="mb-6 h-7 w-full max-w-[150px] text-white"
                      style={{
                        backgroundColor: 'currentColor',
                        WebkitMaskImage: `url(${DEALER_LOGO[m.code]})`,
                        maskImage: `url(${DEALER_LOGO[m.code]})`,
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'left center',
                        maskPosition: 'left center',
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                      }}
                    />
                  ) : (
                    <div className="h-display mb-6 text-[1.5rem] leading-tight text-white">{m.dealerName}</div>
                  )}
                  <div className="mt-auto space-y-3">
                    {m.supportPhone && (
                      <a
                        href={`tel:${m.supportPhone.replace(/\s+/g, '')}`}
                        className="flex items-center gap-2 text-sm text-fog transition-colors hover:text-white"
                      >
                        <Phone size={14} strokeWidth={2} className="shrink-0 text-stroxx-blue" />
                        {m.supportPhone}
                      </a>
                    )}
                    {m.supportHours && <div className="text-xs leading-relaxed text-fog/50">{m.supportHours}</div>}
                    {m.dealerCtaUrl && (
                      <a
                        href={m.dealerCtaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-arrow inline-flex items-center gap-1.5 pt-1 text-sm"
                      >
                        Visit {m.dealerName}
                        <ArrowUpRight size={15} strokeWidth={2} />
                      </a>
                    )}
                    {!m.supportPhone && !m.dealerCtaUrl && (
                      <div className="text-xs text-fog/40">Contact details coming soon.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DealerChooserContext.Provider>
  );
}
