'use client';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlassButton from '@/components/GlassButton';
import { UTM, CR_BRAND, bagTools, formatDKK } from '@/lib/data';

const ToolBagScene = dynamic(() => import('@/components/scene/ToolBagScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center text-fog text-sm">Laster posen…</div>,
});

export default function HeroStage() {
  const [fill, setFill] = useState(0);
  const total = useMemo(
    () => bagTools.slice(0, fill).reduce((s, t) => s + t.price, 0),
    [fill]
  );

  return (
    <section className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* soft-black stage with blue light spill */}
        <div className="absolute inset-0 bg-ink" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 55% at 50% 78%, rgba(0,130,202,0.16), transparent 70%), radial-gradient(40% 40% at 18% 22%, rgba(0,130,202,0.08), transparent 70%)',
          }}
        />

        {/* the WebGL bag */}
        <ErrorBoundary fallback={null}>
          <ToolBagScene onFill={setFill} />
        </ErrorBoundary>

        {/* hero copy */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
          <div className="mx-auto w-full max-w-[1500px] px-5 md:px-10 pt-24 md:pt-28">
            <h1 className="h-display text-white text-[clamp(2.8rem,10vw,9.5rem)] leading-[0.86]">
              Dyrt værktøj
              <br />
              til <span className="text-stroxx-blue">udyr</span> pris
            </h1>
          </div>

          {/* price tag — tools fall into the bag and the total ticks up */}
          <div className="mt-auto mx-auto w-full max-w-[1500px] px-5 md:px-10 pb-10 flex items-end justify-between gap-6">
            <div className="max-w-md">
              <p className="text-fog text-base md:text-lg leading-relaxed">
                Ligesom alt dit dyre værktøj. Det koster bare ikke nær så meget.
                <span className="text-white"> Fedt værktøj til temmelig tynde priser.</span> Simpelthen.
              </p>
              <div className="pointer-events-auto mt-6 flex flex-wrap items-center gap-3">
                <GlassButton href="/produkter">Se produkterne</GlassButton>
                <GlassButton href={`${CR_BRAND}/?${UTM}`} external variant="ghost">Køb hos Carl Ras</GlassButton>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <div className="inline-flex flex-col items-end rounded-sm border border-line bg-carbon/80 backdrop-blur px-5 py-3">
                <span className="eyebrow mb-1">I posen</span>
                <span className="font-display font-extrabold text-white text-2xl tabular-nums">
                  {formatDKK(total)} <span className="text-fog text-sm font-normal">DKK</span>
                </span>
                <span className="text-fog text-xs mt-0.5">{fill} varer · scroll og fyld posen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
