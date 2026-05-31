'use client';
import { useEffect, useState } from 'react';
import { Check, X, FileText, ArrowRight } from 'lucide-react';
import GlassButton from '@/components/GlassButton';

const PDF = '/STROXX-tilfredshedsgaranti.pdf';

const POINTS = [
  'Er du ikke tilfreds, får du pengene tilbage.',
  'Ingen krav om fejl — din vurdering er nok.',
  'Gælder alle STROXX-produkter (dog ikke adgangskontrol).',
];

export default function GuaranteeModal({ trigger = 'Sådan virker garantien' }: { trigger?: string }) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false); // drives the enter/exit transition

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setShow(true));
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
      window.addEventListener('keydown', onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { cancelAnimationFrame(id); window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }
  }, [open]);

  const close = () => { setShow(false); setTimeout(() => setOpen(false), 220); };

  return (
    <>
      <button onClick={() => setOpen(true)} className="link-arrow mt-8">
        {trigger} <ArrowRight size={15} />
      </button>

      {open && (
        <div
          role="dialog" aria-modal="true" aria-label="STROXX tilfredshedsgaranti"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* backdrop */}
          <div
            onClick={close}
            className="absolute inset-0 bg-ink/70 backdrop-blur-md transition-opacity duration-300"
            style={{ opacity: show ? 1 : 0 }}
          />

          {/* panel */}
          <div
            className="relative w-full max-w-lg glass rounded-2xl p-7 sm:p-9 transition-all duration-300 will-change-transform"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.97)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,130,202,0.18)',
            }}
          >
            <button
              onClick={close} aria-label="Luk"
              className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full text-fog hover:text-white border border-white/10 hover:border-white/25 transition-colors"
            >
              <X size={17} />
            </button>

            <div className="eyebrow mb-3">30 dages tilfredshedsgaranti</div>
            <h2 className="h-display text-white text-[clamp(1.6rem,4vw,2.2rem)] leading-[1.02] mb-4">
              Tilfreds — eller pengene tilbage.
            </h2>
            <p className="text-fog leading-relaxed mb-6">
              Vi står inde for vores værktøj. Som erhvervskunde med konto kan du prøve dit
              STROXX-produkt i <span className="text-white">30 dage</span>.
            </p>

            <ul className="space-y-3 mb-6">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-stroxx-blue/20 text-stroxx-blue">
                    <Check size={13} strokeWidth={2.6} />
                  </span>
                  <span className="text-white/90 text-[15px] leading-snug">{p}</span>
                </li>
              ))}
            </ul>

            <p className="text-fog/80 text-sm leading-relaxed mb-1">
              Test varen, inden du køber stort ind — garantien gælder den først købte ved køb af
              ens varer i mængde.
            </p>
            <p className="text-fog/80 text-sm leading-relaxed mb-7">
              <span className="text-white/80">Returnering:</span> aflevér produktet hos din forhandler
              (eller kontakt kundeservice ved online-køb) med faktura eller følgeseddel. Carl Ras
              kundeservice: <a href="tel:+4544855511" className="text-stroxx-blue hover:text-white transition-colors">44 85 55 11</a>.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <GlassButton href={PDF} external>
                <FileText size={16} /> Se garantien (PDF)
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
