'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import BuyButton from '@/components/BuyButton';
import { brandImages } from '@/lib/data';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-colors duration-300 ${
        scrolled
          ? 'bg-ink/55 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-[1600px] px-6 md:px-10 h-20 flex items-center justify-between">
        <Link href="/" aria-label="STROXX" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brandImages.logoWhite} alt="STROXX" className="h-7 md:h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-7 text-[13px] text-fog">
          <Link href="/produkter" className="hidden sm:inline hover:text-white transition-colors">Produkter</Link>
          <Link href="/butikker" className="hidden sm:inline hover:text-white transition-colors">Butikker</Link>
          <a href="/#specialister" className="hidden md:inline hover:text-white transition-colors">Specialister</a>
          <BuyButton href="https://www.carl-ras.dk/maerker/stroxx/" />
        </div>
      </nav>
    </header>
  );
}
