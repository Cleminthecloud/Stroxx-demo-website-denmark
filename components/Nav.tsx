'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import BuyButton from '@/components/BuyButton';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { brandImages, CR_BRAND, UTM } from '@/lib/data';

const LINKS = [
  { href: '/maanedens', label: 'Tool of the Month' },
  { href: '/produkter', label: 'Products' },
  { href: '/butikker', label: 'Stores' },
  { href: '/butikker?tab=specialister', label: 'Specialists' },
  { href: '/fag', label: 'Trades' },
  { href: '/proev-det', label: 'Try It' },
  { href: '/service', label: 'Service and Support' },
];

export default function Nav({ links = LINKS, logoSrc }: { links?: { href: string; label: string }[]; logoSrc?: string }) {
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
    <>
      {/* MOBILE MENU — a SIBLING of the header, never a child. HARD RULE:
          the header gets backdrop-filter when scrolled/open, and a filter on
          an ancestor makes it the CONTAINING BLOCK for position:fixed
          descendants — a fixed menu inside the header collapses to the 80px
          header box (background squashed into a strip, links overflow with no
          sheet behind them). That was the "no background, one link" bug, on
          every browser. z-[90] keeps it under the header row (z-100), so the
          logo and the X stay visible on top of the sheet. */}
      <div
        id="mobile-menu"
        data-lenis-prevent
        aria-hidden={!open}
        className={`sm:hidden fixed inset-0 z-[90] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background:
            'radial-gradient(120% 50% at 50% -10%, rgba(0,136,194,0.16), transparent 60%), #0A0B0D',
        }}
      >
        <div className="flex h-full flex-col px-6 pt-28 pb-10 overflow-y-auto">
          <nav className="flex flex-col gap-1" aria-label="Mobile menu">
            {links.map((l, i) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="h-display text-white text-[2rem] leading-tight py-2.5 border-b border-white/[0.06] flex items-center justify-between hover:text-stroxx-blue transition-colors"
                style={{
                  // staggered rise: each link arrives a beat after the sheet
                  opacity: open ? 1 : 0,
                  transform: open ? 'none' : 'translateY(16px)',
                  transition: `opacity .55s cubic-bezier(.16,1,.3,1) ${90 + i * 50}ms, transform .55s cubic-bezier(.16,1,.3,1) ${90 + i * 50}ms, color .2s`,
                }}
              >
                {l.label}
                <span className="text-fog/40 text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              </Link>
            ))}
          </nav>
          <div
            className="mt-auto flex flex-col gap-5 pt-8"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? 'none' : 'translateY(16px)',
              transition: `opacity .55s cubic-bezier(.16,1,.3,1) ${90 + links.length * 50}ms, transform .55s cubic-bezier(.16,1,.3,1) ${90 + links.length * 50}ms`,
            }}
          >
            <LocaleSwitcher variant="inline" />
            <a href="tel:+4544855511" className="flex items-center gap-2.5 text-fog text-sm" tabIndex={open ? 0 : -1}>
              <Phone size={15} strokeWidth={2} className="text-stroxx-blue" /> Customer service 44 85 55 11
            </a>
            <BuyButton href={`${CR_BRAND}/?${UTM}`} className="w-full justify-center" />
          </div>
        </div>
      </div>

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
              src={logoSrc || brandImages.logoWhite}
              alt="STROXX"
              className={`w-auto transition-[height] duration-300 ease-out ${scrolled ? 'h-6' : 'h-7 md:h-8'}`}
            />
          </Link>
          <div className="flex items-center gap-4 sm:gap-7 text-[13px] text-fog">
            {links.slice(0, 4).map((l, i) => (
              <Link key={l.href} href={l.href}
                className={`${['hidden lg:inline', 'hidden sm:inline', 'hidden sm:inline', 'hidden md:inline'][i]} hover:text-white transition-colors`}>
                {l.label}
              </Link>
            ))}
            <span className="hidden sm:inline-flex"><LocaleSwitcher /></span>
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
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] text-white bg-white/[0.04]"
            >
              {open ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}
