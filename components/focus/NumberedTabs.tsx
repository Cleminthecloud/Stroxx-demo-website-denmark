'use client';
import { useId, useRef, useState } from 'react';

export type TabItem = { title: string; body?: string; img?: string | null; alt?: string; colour?: boolean };

/** Numbered selling points with a photo that follows the selected point (the
 *  Webflow "KSP tabs"). Desktop: a real ARIA tablist on the left, the active
 *  point's photo on the right, arrow keys move between points. Phones: every
 *  point is shown in full with its own photo, nothing hidden behind a tap. */
export default function NumberedTabs({ items }: { items: TabItem[] }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  if (!items.length) return null;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const last = items.length - 1;
    const next = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
      : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
      : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <>
      {/* phones: stacked, everything visible */}
      <ol className="grid list-none gap-10 p-0 lg:hidden">
        {items.map((it, i) => (
          <li key={i}>
            {it.img && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={it.img} alt={it.alt || ''} loading="lazy" className={`mb-5 aspect-[4/3] w-full rounded-2xl object-cover ${it.colour === false ? 'grayscale' : ''}`} />
            )}
            <div className="flex gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stroxx-blue text-sm font-medium text-white">{i + 1}</span>
              <div>
                <h3 className="mb-2 text-xl font-medium text-white">{it.title}</h3>
                {it.body && <p className="leading-relaxed text-fog">{it.body}</p>}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* desktop: tablist + swapping photo */}
      <div className="hidden gap-12 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center">
        <div role="tablist" aria-orientation="vertical" className="flex flex-col gap-3">
          {items.map((it, i) => {
            const on = i === active;
            return (
              <button
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                id={`${base}-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`${base}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`group flex w-full gap-5 rounded-2xl border p-6 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroxx-blueGlow ${
                  on ? 'border-stroxx-blue/60 bg-white/[0.04]' : 'border-transparent hover:border-white/10'
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-medium transition-colors ${
                    on ? 'bg-stroxx-blue text-white' : 'border border-white/20 text-fog group-hover:text-white'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="block">
                  <span className={`block text-xl font-medium transition-colors ${on ? 'text-white' : 'text-fog group-hover:text-white'}`}>{it.title}</span>
                  {it.body && (
                    <span
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${on ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                      <span className="overflow-hidden leading-relaxed text-fog">{it.body}</span>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${active}`} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-steel xl:aspect-[5/5]">
          {items.map((it, i) =>
            it.img ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={i}
                src={it.img}
                alt={i === active ? it.alt || '' : ''}
                aria-hidden={i !== active}
                loading={i === 0 ? 'eager' : 'lazy'}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'} ${it.colour === false ? 'grayscale' : ''}`}
              />
            ) : null,
          )}
        </div>
      </div>
    </>
  );
}
