'use client';

/** Branded error boundary: something server-side threw. Honest, calm, retry. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="bg-ink min-h-[100svh] flex items-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(55% 55% at 50% 45%, rgba(0,136,194,0.10), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-32 w-full">
        <div className="eyebrow mb-6">Error</div>
        <h1 className="h-display text-white text-[clamp(2.4rem,7vw,6rem)] leading-[0.9] mb-6">
          Something <span className="text-stroxx-blue">slipped.</span>
        </h1>
        <p className="text-fog text-lg md:text-xl leading-relaxed max-w-xl mb-10">
          Not your fault. Try again, and if it keeps happening, we're already embarrassed.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={reset} className="glass-cta inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white">
            Try again
          </button>
          <a href="/" className="link-arrow text-sm ml-1">Back to the front page</a>
        </div>
      </div>
    </main>
  );
}
