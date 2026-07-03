import Link from 'next/link';
import GlassButton from '@/components/GlassButton';
import { ArrowRight } from 'lucide-react';

/** Branded 404: same voice as the rest of the site, and always a way onward. */
export default function NotFound() {
  return (
    <main className="bg-ink min-h-[100svh] flex items-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(55% 55% at 50% 45%, rgba(0,130,202,0.12), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-32 w-full">
        <div className="eyebrow mb-6">404</div>
        <h1 className="h-display text-white text-[clamp(2.6rem,8vw,7rem)] leading-[0.9] mb-6">
          This page took<br />the <span className="text-stroxx-blue">day off.</span>
        </h1>
        <p className="text-fog text-lg md:text-xl leading-relaxed max-w-xl mb-10">
          The address doesn't exist (anymore). The tools do, though, and they're this way.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <GlassButton href="/">Back to the front page <ArrowRight size={16} /></GlassButton>
          <GlassButton href="/produkter" variant="ghost">See the products</GlassButton>
          <Link href="/butikker" className="link-arrow text-sm ml-1">Find a store <ArrowRight size={15} strokeWidth={2} /></Link>
        </div>
      </div>
    </main>
  );
}
