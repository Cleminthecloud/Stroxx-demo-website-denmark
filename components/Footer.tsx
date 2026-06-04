import Link from 'next/link';
import { Phone } from 'lucide-react';
import { UTM, CR_BRAND, brandImages } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brandImages.logoWhite} alt="STROXX" className="h-7 w-auto mb-7" />
            <p className="text-fog leading-relaxed">
              <span className="text-white font-medium">STROXX fås eksklusivt hos Carl Ras i Danmark.</span> Men
              brandet er udviklet i samarbejde med stærke partnere i Tyskland, Frankrig og Belgien og
              forhandles også gennem kæder som Meesenburg, Foussier og Lecot.
            </p>
            <a href="tel:+4544855511" className="mt-7 inline-flex items-center gap-2.5 text-stroxx-blue text-xl font-medium hover:text-white transition-colors">
              <Phone size={18} strokeWidth={2} /> +45 44 85 55 11
            </a>
            <div className="mt-5 text-fog text-sm leading-relaxed">
              Mandag til Torsdag: 07:00 – 16:00<br />
              Fredag: 07:00 – 15:00
            </div>
          </div>

          <div className="text-sm">
            <div className="text-fog/60 text-xs uppercase tracking-wider mb-4">Sider</div>
            <div className="space-y-3">
              <Link href="/produkter" className="block text-fog hover:text-white">Produkter</Link>
              <a href="/#specialister" className="block text-fog hover:text-white">Specialister</a>
            </div>
          </div>
          <div className="text-sm">
            <div className="text-fog/60 text-xs uppercase tracking-wider mb-4">Køb</div>
            <div className="space-y-3">
              <a href={`${CR_BRAND}/?${UTM}`} target="_blank" rel="noopener noreferrer" className="block text-fog hover:text-white">Køb STROXX</a>
              <Link href="/butikker" className="block text-fog hover:text-white">Find butik</Link>
            </div>
          </div>
        </div>

        <div className="mt-20 text-xs text-fog/50">
          © Carl Ras A/S &nbsp;|&nbsp; Mileparken 31 &nbsp;|&nbsp; 2730 Herlev &nbsp;|&nbsp; CVR: DK 70 58 71 14
        </div>
      </div>
    </footer>
  );
}
