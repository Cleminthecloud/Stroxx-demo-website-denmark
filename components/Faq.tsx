'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

export type FaqItem = { q: string; a: React.ReactNode };

/** Accordion in the site's glass style. The matching FAQPage JSON-LD is
 *  rendered server-side by the page that uses this (keep the two in sync). */
export default function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-line">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className={`text-base font-medium transition-colors md:text-lg ${isOpen ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                {item.q}
              </span>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                  isOpen
                    ? 'rotate-45 border-stroxx-blue/60 text-stroxx-blue shadow-[0_0_18px_rgba(0,130,202,0.35)]'
                    : 'border-line text-fog group-hover:border-stroxx-blue/60 group-hover:text-stroxx-blueGlow group-hover:shadow-[0_0_18px_rgba(0,130,202,0.3)]'
                }`}
              >
                <Plus size={15} />
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <div className="pb-6 pr-14 text-[15px] leading-relaxed text-fog">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
