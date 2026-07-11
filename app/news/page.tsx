import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPosts, getSiteSettings } from '@/lib/cms';
import { assetUrl } from '@/sanity/lib/image';
import { stegaClean } from '@sanity/client/stega';
import NewsExplorer from '@/components/NewsExplorer';
import type { NewsCardData } from '@/components/NewsCard';

/** News index: every published `post`, newest first, in the site's glass
 *  design system with tag-chip filtering (the /products pattern). Tags come
 *  straight from the articles, so editors create filters just by tagging. */

export const metadata: Metadata = {
  title: 'News',
  description: 'News and stories from STROXX: new tools, campaigns and life on site.',
  alternates: { canonical: '/news' },
};

function fmtDate(iso?: string) {
  if (!iso) return undefined;
  try {
    return new Date(stegaClean(iso)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return undefined;
  }
}

export default async function NewsIndex() {
  const posts = await getPosts();
  const settings = await getSiteSettings();
  /* market switch: Site settings → News section enabled */
  if (settings?.newsEnabled === false) notFound();
  /* plain serializable cards for the client explorer; tags are stegaCleaned
     because the chips compare them as values */
  const cards: NewsCardData[] = posts
    .map((p) => ({
      slug: stegaClean(p.slug?.current) || '',
      title: p.title || '',
      excerpt: p.excerpt,
      date: fmtDate(p.publishedAt),
      img: assetUrl(p.heroImage, 900),
      alt: stegaClean((p.heroImage as { alt?: string } | null)?.alt) || '',
      tags: (p.tags ?? []).map((t) => stegaClean(t) || '').filter(Boolean),
    }))
    .filter((c) => c.slug && c.title);

  return (
    <main className="bg-ink min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-36 pb-28">
        <div className="eyebrow mb-6">News</div>
        <h1 className="h-display text-white text-[clamp(2.6rem,6vw,5rem)] leading-[0.92] mb-6">
          {settings?.newsHeadline || "What's happening."}
        </h1>
        <p className="text-fog text-lg max-w-xl leading-relaxed mb-12">
          {settings?.newsIntro || 'Tips, specialist know-how and news from the trades. Filter by what you work with.'}
        </p>

        {cards.length === 0 ? (
          <p className="text-fog text-lg max-w-md leading-relaxed">
            {settings?.newsEmpty || 'Nothing published yet. The first stories are on their way.'}
          </p>
        ) : (
          <NewsExplorer posts={cards} />
        )}
      </div>
    </main>
  );
}
