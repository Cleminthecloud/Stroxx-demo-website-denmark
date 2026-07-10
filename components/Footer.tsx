import Link from 'next/link';
import FooterBuyLink from '@/components/FooterBuyLink';
import { Phone } from 'lucide-react';
import { CR_BRAND, brandImages } from '@/lib/data';
import { getSiteSettings, cleanLinks } from '@/lib/cms';
import { getLocale } from '@/lib/locale';

const PAGES_FALLBACK = [
  { label: 'Tool of the Month', href: '/maanedens' },
  { label: 'Products', href: '/produkter' },
  { label: 'Trades', href: '/fag' },
  { label: 'Stores', href: '/butikker' },
  { label: 'News', href: '/nyheder' },
  { label: 'Campaign: Try It', href: '/proev-det' },
  { label: 'Service and Support', href: '/service' },
];

/* the about paragraph is CMS text; partner names become links automatically
   so editors keep plain text and the links never break */
const PARTNER_URLS: Record<string, string> = {
  Meesenburg: 'https://www.meesenburg.com',
  Foussier: 'https://www.foussier.fr',
  Lecot: 'https://lecot.be',
};

/* Dealer partner logos, shown in the footer on the international site (no single
   retailer). Single-colour SVGs tinted via CSS mask so they sit on the dark bg. */
const PARTNER_LOGOS: { code: string; name: string; src: string; href: string }[] = [
  { code: 'dk', name: 'Carl Ras', src: '/brand/partners/carl-ras.svg', href: 'https://www.carl-ras.dk' },
  { code: 'de', name: 'Meesenburg', src: '/brand/partners/meesenburg.svg', href: 'https://www.meesenburg.com' },
  { code: 'fr', name: 'Foussier', src: '/brand/partners/foussier.svg', href: 'https://www.foussier.fr' },
  { code: 'be', name: 'Lecot', src: '/brand/partners/lecot.svg', href: 'https://lecot.be' },
];

function linkify(text: string, keyBase: string) {
  return text.split(/(Meesenburg|Foussier|Lecot)/g).map((p, i) =>
    PARTNER_URLS[p] ? (
      <a key={`${keyBase}-${i}`} href={PARTNER_URLS[p]} target="_blank" rel="noopener noreferrer"
        className="underline decoration-fog/40 underline-offset-2 hover:text-white">{p}</a>
    ) : (
      <span key={`${keyBase}-${i}`}>{p}</span>
    )
  );
}

function AboutText({ text }: { text: string }) {
  /* first sentence carries the design's white emphasis, the rest stays fog */
  const m = text.match(/^(.*?[.!?])\s+([\s\S]*)$/);
  if (!m) return <>{linkify(text, 'a')}</>;
  return (
    <>
      <span className="text-white font-medium">{linkify(m[1], 'w')}</span> {linkify(m[2], 'r')}
    </>
  );
}

function FooterLink({ label, href }: { label: string; href: string }) {
  return /^https?:/i.test(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block text-fog hover:text-white">{label}</a>
  ) : (
    <Link href={href} className="block text-fog hover:text-white">{label}</Link>
  );
}

export default async function Footer() {
  const s = await getSiteSettings();
  const { market } = await getLocale();
  /* International (stroxx.eu) shows every dealer; a local market shows only its own. */
  const footerDealers =
    market && market !== 'int' ? PARTNER_LOGOS.filter((p) => p.code === market) : PARTNER_LOGOS;
  const pageLinks = cleanLinks(s?.footerPageLinks) ?? PAGES_FALLBACK;
  const buyLinks = cleanLinks(s?.footerBuyLinks) ?? [
    { label: 'Find a store', href: '/butikker' },
    { label: 'Satisfaction guarantee (PDF)', href: '/STROXX-tilfredshedsgaranti.pdf' },
  ];
  const phone = s?.supportPhone || '+45 44 85 55 11';
  const hours = s?.supportHours || 'Monday to Thursday: 07:00 to 16:00\nFriday: 07:00 to 15:00';
  const legal = s?.legalLine || '© Carl Ras A/S | Mileparken 31 | 2730 Herlev | CVR: DK 70 58 71 14';
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brandImages.logoWhite} alt="STROXX" className="h-7 w-auto mb-7" />
            <p className="text-fog leading-relaxed">
              <AboutText
                text={
                  s?.footerAbout ||
                  'STROXX is available exclusively at Carl Ras in Denmark. The brand is developed together with strong partners in Germany, France and Belgium, and is also stocked through chains like Meesenburg, Foussier and Lecot.'
                }
              />
            </p>
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className="mt-7 inline-flex items-center gap-2.5 text-stroxx-blue text-xl font-medium hover:text-white transition-colors">
              <Phone size={18} strokeWidth={2} /> {phone}
            </a>
            <div className="mt-5 text-fog text-sm leading-relaxed whitespace-pre-line">
              {hours}
            </div>
          </div>

          <div className="text-sm">
            <div className="text-fog/60 text-xs uppercase tracking-wider mb-4">Pages</div>
            <div className="space-y-3">
              {pageLinks.map((l) => <FooterLink key={l.href} {...l} />)}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-fog/60 text-xs uppercase tracking-wider mb-4">Buy</div>
            <div className="space-y-3">
              <FooterBuyLink />
              {buyLinks
                .filter((l) => !/carl-ras\.dk/i.test(l.href) && !l.href.startsWith(CR_BRAND))
                .map((l) => <FooterLink key={l.href} {...l} />)}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-fog/50">
          <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {footerDealers.map((pl) => (
                <a
                  key={pl.href}
                  href={pl.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={pl.name}
                  className="text-fog/60 hover:text-white transition-colors"
                >
                  <span
                    role="img"
                    aria-label={pl.name}
                    className="block h-5 w-[74px]"
                    style={{
                      backgroundColor: 'currentColor',
                      WebkitMaskImage: `url(${pl.src})`,
                      maskImage: `url(${pl.src})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'left center',
                      maskPosition: 'left center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                    }}
                  />
                </a>
              ))}
          </span>
          <span>{legal}</span>
          <span className="flex gap-4">
            <Link href="/privatliv" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/handelsbetingelser" className="hover:text-white transition-colors">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
