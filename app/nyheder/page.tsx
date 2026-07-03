import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { getPosts } from '@/lib/cms';
import { assetUrl } from '@/sanity/lib/image';
import { stegaClean } from '@sanity/client/stega';

/** News index: every published `post` document, newest first. The whole
 *  section only comes alive when editors write; until then a friendly
 *  empty state renders and the page stays linkable. */

export const metadata: Metadata = {
  title: 'News',
  description: 'News and stories from STROXX: new tools, campaigns and life on site.',
  alternates: { canonical: '/nyheder' },
};

function fmtDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(stegaClean(iso)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

export default async function NewsIndex() {
  const posts = await getPosts();
  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-36 pb-28">
        <div className="eyebrow mb-6">News</div>
        <h1 className="h-display text-white text-[clamp(2.6rem,6vw,5rem)] leading-[0.92] mb-16">
          What&apos;s happening.
        </h1>

        {posts.length === 0 ? (
          <p className="text-fog text-lg max-w-md leading-relaxed">
            Nothing published yet. The first stories are on their way.
          </p>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => {
              const slug = stegaClean(p.slug?.current) || '';
              const img = assetUrl(p.heroImage, 900);
              const alt = (p.heroImage as { alt?: string } | null)?.alt || '';
              const date = fmtDate(p.publishedAt);
              return (
                <Reveal key={p._id || slug} delay={Math.min(i, 5) * 70}>
                  <Link href={`/nyheder/${slug}`} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-white/[0.04] mb-5">
                      {img && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={img} alt={stegaClean(alt)} loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                      )}
                    </div>
                    {date && <div className="text-fog/60 text-xs uppercase tracking-wider mb-2">{date}</div>}
                    <h2 className="text-white text-xl font-medium leading-snug mb-2 group-hover:text-stroxx-blue transition-colors">
                      {p.title}
                    </h2>
                    {p.excerpt && <p className="text-fog text-[15px] leading-relaxed line-clamp-3">{p.excerpt}</p>}
                    <span className="link-arrow text-sm mt-3 inline-flex items-center gap-1.5 text-stroxx-blue">
                      Read <ArrowRight size={14} />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
