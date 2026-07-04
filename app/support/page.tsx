import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { getSupportPages } from '@/lib/cms';
import { stegaClean } from '@sanity/client/stega';

/** Support & downloads index: every supportPage document as a glass card.
 *  These pages carry the packaging QR traffic inherited from the old
 *  stroxx.eu store, so this section must always resolve fast and clean. */

export const metadata: Metadata = {
  title: 'Support & downloads',
  description: 'Manuals, software guides and product documentation for STROXX tools, in your language.',
  alternates: { canonical: '/support' },
};

export default async function SupportIndex() {
  const pages = await getSupportPages();
  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-36 pb-28">
        <div className="eyebrow mb-6">Support</div>
        <h1 className="h-display text-white text-[clamp(2.6rem,6vw,5rem)] leading-[0.92] mb-6">
          Manuals &amp; downloads.
        </h1>
        <p className="text-fog text-lg max-w-xl leading-relaxed mb-12">
          User instructions, software guides and product documentation, in your language. Scan the code on the box and you land here.
        </p>

        {pages.length === 0 ? (
          <p className="text-fog text-lg max-w-md leading-relaxed">
            Nothing published yet. The first documents are on their way.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => {
              const slug = stegaClean(p.slug?.current) || '';
              const count = (p.groups ?? []).reduce((a, g) => a + (g.items?.length ?? 0), 0);
              return (
                <Link key={p._id} href={`/support/${slug}`} className="group glass-panel rounded-xl p-7 block">
                  <FileText size={22} className="text-stroxx-blue mb-4" />
                  <h2 className="text-white font-display font-bold text-2xl mb-1.5">{p.title}</h2>
                  <p className="text-fog text-sm leading-relaxed mb-5">
                    {p.intro || `${count} document${count === 1 ? '' : 's'} to download.`}
                  </p>
                  <span className="link-arrow text-sm">
                    Open <ArrowRight size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
