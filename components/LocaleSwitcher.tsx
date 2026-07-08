'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { locales, resolveLocale, type Locale } from '@/lib/i18n';

/** Top-nav language / market switcher. Resolves the current locale from the
 *  host + path (same rules as the middleware), and builds a link to the same
 *  page in each other locale, cross-domain on the real ccTLDs, sub-path on the
 *  .eu / preview host. Glass dropdown to match the site. */
export default function LocaleSwitcher() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setHost(window.location.host), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); window.removeEventListener('keydown', onKey); };
  }, [open]);

  const h = host.replace(/^www\./, '').toLowerCase();
  const onCcTLD = !!host && locales.some((l) => !l.isReference && l.domain === h);
  const current = resolveLocale(host, pathname).locale;

  const prefix = onCcTLD ? current.domainPath : current.path;
  const inLocale =
    prefix && (pathname === prefix || pathname.startsWith(prefix + '/')) ? pathname.slice(prefix.length) || '/' : pathname;
  const suffix = inLocale === '/' ? '' : inLocale;
  const hrefFor = (t: Locale) => (onCcTLD ? `https://${t.domain}${t.domainPath}${suffix}` : `${t.path}${suffix}` || '/');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Choose language"
        className="inline-flex items-center gap-1.5 text-fog hover:text-white transition-colors"
      >
        <Globe size={15} strokeWidth={2} />
        <span className="text-[13px] tabular-nums uppercase">{current.htmlLang}</span>
        <ChevronDown size={13} strokeWidth={2} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="glass-panel absolute right-0 top-full mt-3 min-w-[210px] rounded-xl p-1.5 z-[110]"
          role="menu"
          /* near-opaque fill so the rows stay legible (WCAG AA) over the hero;
             keeps glass-panel's blur, border and shadow for the look */
          style={{ background: 'rgba(11, 13, 16, 0.97)' }}
        >
          {locales.map((l) => (
            <a
              key={l.id}
              href={hrefFor(l)}
              role="menuitem"
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                l.id === current.id ? 'text-white bg-white/[0.08]' : 'text-white/80 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {l.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
