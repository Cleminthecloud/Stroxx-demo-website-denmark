'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, X, LocateFixed, ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react';
import { stores as fallbackStores, distanceKm, hoursLabel, type Store } from '@/lib/stores';
import SpecialistChat from '@/components/SpecialistChat';
import { useDealerChooser } from '@/components/DealerChooser';

/** Phone-first "talk to a specialist" FAB. Pros ring, they rarely chat, and we
 *  have every butikschef's direct number from the CMS. Geolocation offers the
 *  nearest one; fallback is the current MARKET dealer's customer service line
 *  (market doc via the dealer-chooser context) — international has no single
 *  dealer, so that row hides and the store finder link carries the weight. */

export type FabCopy = {
  fabLabel?: string;
  panelHeadline?: string;
  panelText?: string;
  greeting?: string;
  fallback?: string;
};

export default function SpecialistFab({ storeData, copy }: { storeData?: Store[]; copy?: FabCopy }) {
  const stores = storeData && storeData.length ? storeData : fallbackStores;
  const { currentDealer } = useDealerChooser();
  const servicePhone = currentDealer?.supportPhone || '';
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  // product pages have a sticky mobile buy bar at the bottom; float above it
  const onProduct = pathname?.startsWith('/product/');

  // the closed panel is visually hidden but stays mounted (exit transition) —
  // `inert` keeps its buttons/links out of the tab order and screen readers
  useEffect(() => {
    panelRef.current?.toggleAttribute('inert', !open);
  }, [open]);

  // other components (e.g. the specialist map cards) can open the chat directly
  useEffect(() => {
    const openChat = () => { setView('chat'); setOpen(true); };
    window.addEventListener('stroxx:open-chat', openChat);
    return () => window.removeEventListener('stroxx:open-chat', openChat);
  }, []);

  const nearest = useMemo(() => {
    if (!pos) return null;
    let best = stores[0];
    let bestD = Infinity;
    for (const s of stores) {
      const d = distanceKm(pos.lat, pos.lng, s.lat, s.lng);
      if (d < bestD) { bestD = d; best = s; }
    }
    return { store: best, km: bestD };
  }, [pos, stores]);

  const locate = () => {
    if (!navigator.geolocation) { setDenied(true); return; }
    setLocating(true);
    setDenied(false);
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); },
      () => { setDenied(true); setLocating(false); },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  return (
    <div className="no-print">
      {/* backdrop closes the panel on outside tap */}
      {open && (
        <div className="fixed inset-0 z-[88] bg-ink/60 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none" onClick={() => setOpen(false)} />
      )}

      {/* panel */}
      <div
        ref={panelRef}
        role="dialog" aria-label="Talk to a specialist" aria-hidden={!open}
        className={`fixed z-[89] left-0 right-0 bottom-0 w-full rounded-t-2xl border border-white/10 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] transition-[opacity,transform] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none sm:left-auto sm:right-5 sm:w-[calc(100vw-2.5rem)] sm:max-w-sm sm:rounded-2xl sm:pb-6 ${
          onProduct ? 'sm:bottom-[10.5rem]' : 'sm:bottom-[5.5rem]'
        } lg:bottom-24 ${view === 'chat' ? 'flex flex-col h-[min(78svh,580px)] sm:h-[min(72svh,580px)]' : ''} ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 sm:translate-y-3 pointer-events-none'
        }`}
        style={{
          background: 'rgba(13,15,19,0.97)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,136,194,0.18)',
        }}
      >
        <div aria-hidden className="sheet-handle shrink-0" />
        <button onClick={() => setOpen(false)} aria-label="Close"
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] border border-white/10 text-fog hover:text-white transition-colors">
          <X size={14} />
        </button>

        {view === 'chat' ? (
          <>
            <div className="flex items-center gap-2.5 mb-4 shrink-0 pr-10">
              <button onClick={() => setView('home')} aria-label="Back"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] border border-white/10 text-fog hover:text-white transition-colors">
                <ArrowLeft size={14} />
              </button>
              <div className="min-w-0">
                <div className="text-white text-sm font-medium leading-tight">STROXX assistant</div>
                <div className="text-[10px] text-fog uppercase tracking-wider">AI assistant</div>
              </div>
            </div>
            <SpecialistChat nearest={nearest} greeting={copy?.greeting} fallbackText={copy?.fallback} />
          </>
        ) : (
        <>
        <div className="eyebrow mb-3">The specialists</div>
        <h3 className="h-display text-white text-2xl leading-tight mb-2">{copy?.panelHeadline || 'Talk to a specialist.'}</h3>
        <p className="text-fog text-[13px] leading-relaxed mb-5">
          {copy?.panelText || 'Our store managers are tradespeople themselves. Call direct, no phone queue, no switchboard.'}
        </p>

        <button onClick={() => setView('chat')}
          className="glass-cta glass-cta--sm w-full justify-center text-white mb-3">
          <MessageCircle size={13} /> Start chat
          <span className="text-[9px] uppercase tracking-wider rounded-full border border-white/25 px-1.5 py-0.5 ml-1 text-white/80">AI</span>
        </button>

        {nearest && nearest.store.manager ? (
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nearest.store.manager.photo} alt={nearest.store.manager.name}
                className="h-12 w-12 rounded-full object-cover border border-white/15" />
              <div className="min-w-0">
                <div className="text-white text-sm leading-tight">{nearest.store.manager.name}</div>
                <div className="text-fog text-[12px]">
                  {nearest.store.name} ·{' '}
                  <span className="text-stroxx-blue">{nearest.km < 10 ? nearest.km.toFixed(1) : Math.round(nearest.km)} km</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-fog mb-3">{hoursLabel(nearest.store)}</div>
            <div className="flex gap-2">
              <a href={`tel:${nearest.store.manager.phone}`}
                className="glass-cta glass-cta--sm flex-1 justify-center text-white">
                <Phone size={13} /> Call {nearest.store.manager.name.split(' ')[0]}
              </a>
              <a href={`mailto:${nearest.store.manager.email}`} aria-label="Send email"
                className="glass-cta glass-cta--ghost glass-cta--sm justify-center text-white">
                <Mail size={13} />
              </a>
            </div>
          </div>
        ) : (
          <button onClick={locate} disabled={locating}
            className="glass-cta glass-cta--sm w-full justify-center text-white mb-4 disabled:opacity-60">
            <LocateFixed size={13} className={locating ? 'motion-safe:animate-spin' : ''} />
            {locating ? 'Finding your nearest store…' : 'Find my nearest specialist'}
          </button>
        )}
        {denied && (
          <p className="text-[11px] text-fog mb-4">
            We could not get your location. Use the store finder instead, or call customer service.
          </p>
        )}

        <div className={`flex items-center gap-3 pt-4 border-t border-white/[0.08] ${servicePhone ? 'justify-between' : 'justify-end'}`}>
          {servicePhone && (
            <a href={`tel:${servicePhone.replace(/\s+/g, '')}`} className="text-[12px] text-fog hover:text-white transition-colors leading-snug">
              {currentDealer?.dealerName ? `${currentDealer.dealerName} customer service` : 'Customer service'}<br />
              <span className="text-white font-medium">{servicePhone}</span>
            </a>
          )}
          <Link href="/stores" onClick={() => setOpen(false)} className="link-arrow text-[12px] whitespace-nowrap">
            All stores <ArrowRight size={13} />
          </Link>
        </div>
        </>
        )}
      </div>

      {/* the FAB itself */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Talk to a specialist"
        aria-expanded={open}
        className={`fixed z-[89] right-5 ${onProduct ? 'bottom-[calc(6rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(1.25rem+env(safe-area-inset-bottom))]'} lg:bottom-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 text-white pl-4 pr-4 md:pl-5 md:pr-6 h-14 transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] cursor-pointer`}
        style={{
          background: 'linear-gradient(180deg, rgba(0,136,194,0.92), rgba(0,98,154,0.92))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 14px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,136,194,0.35)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <MessageCircle size={19} />
        <span className="hidden md:inline text-sm font-medium tracking-wide">{copy?.fabLabel || 'Talk to a specialist'}</span>
      </button>
    </div>
  );
}
