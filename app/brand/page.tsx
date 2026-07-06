import type { Metadata } from 'next';
import { PortableText } from 'next-sanity';
import { Download } from 'lucide-react';
import BrandGuide from '@/components/BrandGuide';
import { DrawLine, PulseGrid } from '@/components/BrandMarks';
import Reveal from '@/components/Reveal';
import { getBrandPage } from '@/lib/cms';

export const metadata: Metadata = {
  title: 'Brand guide',
  robots: { index: false, follow: false },
};

/** The brand home: animated marks, downloadable color swatches and tokens,
 *  the hard rules (palette, type, glass, motion, from BrandGuide), and the
 *  CMS-grown written guide, incl. the "STROXX the brand vs STROXX the
 *  dealer" teaching. Also shown inside the Studio as the Brand tab.
 *  The full Brand Playbook PDF stays internal (INFO/), not on the site. */

const DOWNLOADS = [
  { href: '/brand/STROXX-colors.ase', label: 'Adobe swatches (.ase)', note: 'Photoshop, Illustrator, InDesign' },
  { href: '/brand/stroxx-tokens.css', label: 'CSS tokens (.css)', note: 'Web and email developers' },
];

export default async function BrandPage() {
  const doc = await getBrandPage();
  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pb-28 pt-32 md:pt-40">
        <Reveal>
          <div className="eyebrow mb-4">Internal · Brand</div>
          <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.95] max-w-3xl">
            One brand. <span className="text-stroxx-blue">Two hats.</span>
          </h1>
          <p className="mt-6 text-fog text-lg leading-relaxed max-w-xl">
            {doc?.intro ||
              'Everything STROXX looks, sounds and moves like, and when to wear which hat: STROXX the brand never talks price; STROXX at the dealer sells. This guide grows over the summer.'}
          </p>
        </Reveal>

        {/* animated brand marks */}
        <div className="mt-14 flex flex-wrap items-end gap-x-16 gap-y-8">
          <Reveal><DrawLine /></Reveal>
          <Reveal delay={120}><PulseGrid /></Reveal>
        </div>

        {/* downloads */}
        <div className="mt-14">
          <Reveal><div className="eyebrow mb-4">Take the colors with you</div></Reveal>
          <div className="flex flex-wrap gap-3">
            {DOWNLOADS.map((d, i) => (
              <Reveal key={d.href} delay={i * 80}>
                <a
                  href={d.href}
                  download
                  className="glass glass-card flex items-center gap-4 rounded-xl px-6 py-4 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-stroxx-blue/40 text-stroxx-blue">
                    <Download size={17} strokeWidth={1.8} />
                  </span>
                  <span>
                    <span className="block text-white text-sm font-medium">{d.label}</span>
                    <span className="block text-fog text-xs">{d.note}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* the hard rules: palette, type, interface, motion (code-owned) */}
      <BrandGuide />

      {/* the growing written guide (CMS) */}
      {doc?.body && doc.body.length > 0 && (
        <div className="mx-auto max-w-3xl px-6 md:px-10 pb-32">
          <div className="eyebrow mb-8">The guide</div>
          <div className="text-fog leading-relaxed space-y-5 [&_strong]:text-white [&_h2]:h-display [&_h2]:text-white [&_h2]:text-3xl [&_h2]:mt-14 [&_h3]:text-white [&_h3]:text-xl [&_h3]:mt-8 [&_a]:text-stroxx-blue [&_img]:rounded-xl">
            <PortableText value={doc.body} />
          </div>
        </div>
      )}
    </main>
  );
}
