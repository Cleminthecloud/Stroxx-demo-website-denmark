import Link from 'next/link';
import { Phone } from 'lucide-react';
import { UTM, CR_BRAND, brandImages } from '@/lib/data';
import { getSiteSettings } from '@/lib/cms';

export default async function Footer() {
  const s = await getSiteSettings();
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
              <span className="text-white font-medium">STROXX is available exclusively at Carl Ras in Denmark.</span> The
              brand is developed together with strong partners in Germany, France and Belgium, and is
              also stocked through chains like{' '}
              <a href="https://www.meesenburg.com" target="_blank" rel="noopener noreferrer" className="underline decoration-fog/40 underline-offset-2 hover:text-white">Meesenburg</a>,{' '}
              <a href="https://www.foussier.fr" target="_blank" rel="noopener noreferrer" className="underline decoration-fog/40 underline-offset-2 hover:text-white">Foussier</a> and{' '}
              <a href="https://lecot.be" target="_blank" rel="noopener noreferrer" className="underline decoration-fog/40 underline-offset-2 hover:text-white">Lecot</a>.
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
              <Link href="/maanedens" className="block text-fog hover:text-white">Tool of the Month</Link>
              <Link href="/produkter" className="block text-fog hover:text-white">Products</Link>
              <Link href="/fag" className="block text-fog hover:text-white">Trades</Link>
              <Link href="/butikker" className="block text-fog hover:text-white">Stores</Link>
              <Link href="/proev-det" className="block text-fog hover:text-white">Campaign: Try It</Link>
              <Link href="/butikker?tab=specialister" className="block text-fog hover:text-white">Specialists</Link>
              <Link href="/service" className="block text-fog hover:text-white">Service and Support</Link>
            </div>
          </div>
          <div className="text-sm">
            <div className="text-fog/60 text-xs uppercase tracking-wider mb-4">Buy</div>
            <div className="space-y-3">
              <a href={`${CR_BRAND}/?${UTM}`} target="_blank" rel="noopener noreferrer" className="block text-fog hover:text-white">Buy STROXX</a>
              <Link href="/butikker" className="block text-fog hover:text-white">Find a store</Link>
              <a href="/STROXX-tilfredshedsgaranti.pdf" target="_blank" rel="noopener noreferrer" className="block text-fog hover:text-white">Satisfaction guarantee (PDF)</a>
            </div>
          </div>
        </div>

        <div className="mt-20 text-xs text-fog/50">
          {legal}
        </div>
      </div>
    </footer>
  );
}
