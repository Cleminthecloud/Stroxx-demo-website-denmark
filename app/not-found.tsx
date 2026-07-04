import Link from 'next/link';
import GlassButton from '@/components/GlassButton';
import { ArrowRight } from 'lucide-react';
import { getSiteSettings } from '@/lib/cms';
import { Accent } from '@/components/cms/LandingSections';

/** Branded 404: same voice as the rest of the site, and always a way onward.
 *  Copy editable in Site settings → Microcopy (*word* = blue accent). */
export default async function NotFound() {
  const s = await getSiteSettings();
  const headline = s?.notFoundHeadline || 'This page took\nthe *day off.*';
  const text = s?.notFoundText || "The address doesn't exist (anymore). The tools do, though, and they're this way.";
  return (
    <main className="bg-ink min-h-[100svh] flex items-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(55% 55% at 50% 45%, rgba(0,136,194,0.12), transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1600px] px-6 md:px-10 py-32 w-full">
        <div className="eyebrow mb-6">404</div>
        <h1 className="h-display text-white text-[clamp(2.6rem,8vw,7rem)] leading-[0.9] mb-6">
          <Accent text={headline} />
        </h1>
        <p className="text-fog text-lg md:text-xl leading-relaxed max-w-xl mb-10">{text}</p>
        <div className="flex flex-wrap items-center gap-3">
          <GlassButton href="/">Back to the front page <ArrowRight size={16} /></GlassButton>
          <GlassButton href="/produkter" variant="ghost">See the products</GlassButton>
          <Link href="/butikker" className="link-arrow text-sm ml-1">Find a store <ArrowRight size={15} strokeWidth={2} /></Link>
        </div>
      </div>
    </main>
  );
}
