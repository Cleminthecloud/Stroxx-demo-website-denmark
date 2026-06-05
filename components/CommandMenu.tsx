'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CalendarRange, ArrowRight } from 'lucide-react';

/* Cmd+K / Ctrl+K palette for the hidden internal pages (not linked in nav).
   Esc or backdrop click closes; arrows + Enter navigate. */

const PAGES = [
  {
    href: '/email-skabeloner',
    label: 'E-mail skabeloner',
    desc: 'Marketo templates i device-mockups',
    icon: Mail,
  },
  {
    href: '/plan',
    label: 'Projektplan',
    desc: 'Leverancer og tidslinje',
    icon: CalendarRange,
  },
];

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const router = useRouter();

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setActive(0);
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => (a + 1) % PAGES.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => (a - 1 + PAGES.length) % PAGES.length);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        go(PAGES[active].href);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, active, go]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh]" role="dialog" aria-modal="true" aria-label="Interne sider">
      <button aria-label="Luk" className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div className="glass-panel relative w-full max-w-md rounded-2xl p-2 shadow-2xl">
        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <span className="eyebrow">Interne sider</span>
          <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-fog">esc</kbd>
        </div>
        {PAGES.map((p, i) => (
          <button
            key={p.href}
            onClick={() => go(p.href)}
            onMouseEnter={() => setActive(i)}
            className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-left transition-colors ${
              i === active ? 'bg-white/[0.07]' : ''
            }`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${
                i === active ? 'border-stroxx-blue/60 text-stroxx-blue' : 'border-line text-fog'
              }`}
            >
              <p.icon size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-white">{p.label}</span>
              <span className="block text-xs text-fog">{p.desc}</span>
            </span>
            <ArrowRight size={15} className={i === active ? 'text-stroxx-blue' : 'text-fog/40'} />
          </button>
        ))}
        <div className="px-4 pb-2.5 pt-2 text-[11px] text-fog/50">↑↓ vælg · enter åbn · ⌘K luk</div>
      </div>
    </div>
  );
}
