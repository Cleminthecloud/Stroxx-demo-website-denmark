'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, X, FileText, ArrowRight } from 'lucide-react';
import GlassButton from '@/components/GlassButton';

const PDF = '/STROXX-tilfredshedsgaranti.pdf';

const POINTS = [
  'Not satisfied? You get your money back.',
  'No need to prove a fault. Your call is enough.',
  'Covers all STROXX products (access control excepted).',
];

export default function GuaranteeModal({ trigger = 'How the guarantee works' }: { trigger?: string }) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false); // drives the enter/exit transition
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setShow(true));
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
      window.addEventListener('keydown', onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // move focus INTO the dialog, and give it back to the trigger on close
      closeRef.current?.focus();
      const trigger = triggerRef.current; // stable node for the cleanup
      return () => {
        cancelAnimationFrame(id);
        window.removeEventListener('keydown', onKey);
        document.body.style.overflow = prev;
        trigger?.focus();
      };
    }
  }, [open]);

  const close = () => { setShow(false); setTimeout(() => setOpen(false), 220); };

  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen(true)} className="link-arrow mt-8">
        {trigger} <ArrowRight size={15} />
      </button>

      {open && (
        <div
          role="dialog" aria-modal="true" aria-label="STROXX satisfaction guarantee"
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
        >
          {/* backdrop */}
          <div
            onClick={close}
            className="absolute inset-0 bg-ink/85 backdrop-blur-lg transition-opacity duration-300"
            style={{ opacity: show ? 1 : 0 }}
          />

          {/* panel — near-opaque so the page never bleeds through the text */}
          <div
            className="relative w-full max-w-none sm:max-w-lg rounded-t-2xl rounded-b-none sm:rounded-2xl border border-white/10 p-7 pb-[calc(1.75rem+env(safe-area-inset-bottom))] sm:p-9 transition-all duration-300 will-change-transform"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.97)',
              background: 'rgba(13,15,19,0.97)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,130,202,0.18)',
            }}
          >
            <div aria-hidden className="sheet-handle" />
            <button
              ref={closeRef}
              onClick={close} aria-label="Close"
              className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full text-fog hover:text-white border border-white/10 hover:border-white/25 transition-colors"
            >
              <X size={17} />
            </button>

            <div className="eyebrow mb-3">30-day satisfaction guarantee</div>
            <h2 className="h-display text-white text-[clamp(1.6rem,4vw,2.2rem)] leading-[1.02] mb-4">
              Full satisfaction or your money back.
            </h2>
            <p className="text-fog leading-relaxed mb-6">
              We stand behind our tools. As a business customer with an account, you can put your
              STROXX product to work for <span className="text-white">30 days</span>.
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
              Test the product before you stock up. When buying identical items in bulk, the
              guarantee applies to the first one purchased.
            </p>
            <p className="text-fog/80 text-sm leading-relaxed mb-7">
              <span className="text-white/80">Returns:</span> hand the product back to your dealer
              (or contact customer service for online purchases) with your invoice or delivery note.
              Carl Ras customer service: <a href="tel:+4544855511" className="text-stroxx-blue hover:text-white transition-colors">44 85 55 11</a>.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <GlassButton href={PDF} external>
                <FileText size={16} /> See the guarantee (PDF)
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
