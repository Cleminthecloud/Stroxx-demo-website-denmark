'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import BuyButton from '@/components/BuyButton';
import { brandImages, CR_BRAND, UTM } from '@/lib/data';

const LINKS = [
  { href: '/produkter', label: 'Produkter' },
  { href: '/butikker', label: 'Butikker' },
  { href: '/butikker?tab=specialister', label: 'Specialister' },
  { href: '/fag', label: 'Fagområder' },
  { href: '/proev-det', label: 'Prøv det' },
  { href: '/service', label: 'Service og support' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the menu on navigation, and Esc closes it like a modal
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-colors duration-300 ${
        scrolled || open
          ? 'bg-ink/55 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* nav tightens as the page scrolls: one height step, in sync with the blur */}
      <nav
        className={`mx-auto max-w-[1600px] px-5 md:px-10 flex items-center justify-between transition-[height] duration-300 ease-out ${
          scrolled ? 'h-14' : 'h-20'
        }`}
      >
        <Link href="/" aria-label="STROXX" className="flex items-center" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brandImages.logoWhite}
            alt="STROXX"
            className={`w-auto transition-[height] duration-300 ease-out ${scrolled ? 'h-6' : 'h-7 md:h-8'}`}
          />
        </Link>
        <div className="flex items-center gap-4 sm:gap-7 text-[13px] text-fog">
          <Link href="/produkter" className="hidden sm:inline hover:text-white transition-colors">Produkter</Link>
          <Link href="/butikker" className="hidden sm:inline hover:text-white transition-colors">Butikker</Link>
          <Link href="/butikker?tab=specialister" className="hidden md:inline hover:text-white transition-colors">Specialister</Link>
          {/* wrapper handles the hide: .glass-cta sets display AFTER tailwind's
              utilities in the cascade, so `hidden` directly on it loses */}
          <span className="hidden sm:inline-flex">
            <BuyButton href={`${CR_BRAND}/?${UTM}`} />
          </span>
          {/* mobile: burger replaces the link row; the buy CTA lives inside the menu */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Luk menu' : 'Åbn menu'}
            className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] text-white bg-white/[0.04]"
          >
            {open ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>
      </nav>

      {/* mobile menu — frosted full-screen sheet under the header row */}
      <div
        id="mobile-menu"
        data-lenis-prevent
        className={`sm:hidden fixed inset-x-0 top-0 bottom-0 -z-10 bg-ink/90 backdrop-blur-2xl transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <div className={`flex h-full flex-col px-6 pt-28 pb-10 transition-transform duration-300 ease-out ${open ? 'translate-y-0' : '-translate-y-3'}`}>
          <nav className="flex flex-col gap-1" aria-label="Mobilmenu">
            {LINKS.map((l, i) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="h-display text-white text-[2rem] leading-tight py-2.5 border-b border-white/[0.06] flex items-center justify-between hover:text-stroxx-blue transition-colors"
              >
                {l.label}
                <span className="text-fog/40 text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-5">
            <a href="tel:+4544855511" className="flex items-center gap-2.5 text-fog text-sm" tabIndex={open ? 0 : -1}>
              <Phone size={15} strokeWidth={2} className="text-stroxx-blue" /> Kundeservice 44 85 55 11
            </a>
            <BuyButton href={`${CR_BRAND}/?${UTM}`} className="w-full justify-center" />
          </div>
        </div>
      </div>
    </header>
  );
}
