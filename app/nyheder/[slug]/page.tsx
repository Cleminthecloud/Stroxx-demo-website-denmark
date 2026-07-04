import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PortableText } from 'next-sanity';
import { getPost, getPosts, productsBySkus } from '@/lib/cms';
import ProductCard from '@/components/ProductCard';
import { assetUrl } from '@/sanity/lib/image';
import { stegaClean } from '@sanity/client/stega';
import { SITE_URL } from '@/lib/site';
import ShareRow from '@/components/ShareRow';
import NewsCard from '@/components/NewsCard';

/** One news article. Portable text body with inline images (alt + caption),
 *  Article JSON-LD for search engines, share image cascade:
 *  own ogImage → hero image → site-wide default. */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const doc = await getPost((await params).slug);
  if (!doc) return { title: 'STROXX' };
  const og = assetUrl(doc.ogImage, 1200) || assetUrl(doc.heroImage, 1200);
  return {
    title: stegaClean(doc.seoTitle) || stegaClean(doc.title) || 'STROXX',
    description: stegaClean(doc.seoDescription) || stegaClean(doc.excerpt) || undefined,
    alternates: { canonical: `/nyheder/${(await params).slug}` },
    ...(og ? { openGraph: { images: [{ url: og, width: 1200, height: 630 }] } } : {}),
  };
}

function fmtDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(stegaClean(iso)).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return null;
  }
}

/* inline images inside the article body */
const components = {
  types: {
    image: ({ value }: { value: { alt?: string; caption?: string } }) => {
      const src = assetUrl(value, 1600);
      if (!src) return null;
      return (
        <figure className="my-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={stegaClean(value.alt) || ''} loading="lazy" className="w-full rounded-2xl" />
          {value.caption && <figcaption className="mt-3 text-fog/60 text-sm">{value.caption}</figcaption>}
        </figure>
      );
    },
  },
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const doc = await getPost(slug);
  if (!doc) notFound();
  /* related content under the article: products the editor tagged by SKU,
     and the three most recent other articles */
  const relatedProducts = productsBySkus(doc.relatedSkus);
  const readNext = (await getPosts()).filter((p) => stegaClean(p.slug?.current) !== slug).slice(0, 3);
  const hero = assetUrl(doc.heroImage, 2200);
  const heroAlt = stegaClean((doc.heroImage as { alt?: string } | null)?.alt) || '';
  const date = fmtDate(doc.publishedAt);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: stegaClean(doc.title) || '',
    ...(doc.publishedAt ? { datePublished: stegaClean(doc.publishedAt) } : {}),
    ...(hero ? { image: [hero] } : {}),
    publisher: { '@type': 'Organization', name: 'STROXX', url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/nyheder/${slug}`,
  };

  return (
    <main className="bg-ink min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-3xl px-6 md:px-10 pt-36 pb-28">
        <Link href="/nyheder" className="inline-flex items-center gap-2 text-fog text-sm hover:text-white transition-colors mb-10">
          <ArrowLeft size={14} /> All news
        </Link>
        {date && <div className="text-fog/60 text-xs uppercase tracking-wider mb-4">{date}</div>}
        <h1 className="h-display text-white text-[clamp(2.2rem,5vw,4rem)] leading-[0.95] mb-8">{doc.title}</h1>
        {doc.excerpt && <p className="text-fog text-xl leading-relaxed mb-10">{doc.excerpt}</p>}
        {hero && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={hero} alt={heroAlt} className="w-full rounded-2xl mb-12" />
        )}
        {doc.body ? (
          <div className="text-fog leading-relaxed space-y-5 text-lg [&_strong]:text-white [&_h2]:text-white [&_h2]:text-2xl [&_h2]:mt-10 [&_h3]:text-white [&_h3]:text-xl [&_h3]:mt-8 [&_a]:text-stroxx-blue [&_blockquote]:border-l-2 [&_blockquote]:border-stroxx-blue [&_blockquote]:pl-5 [&_blockquote]:text-white">
            <PortableText value={doc.body} components={components} />
          </div>
        ) : null}
        <ShareRow url={`${SITE_URL}/nyheder/${slug}`} />
      </article>

      {/* products mentioned in the article (editor-tagged SKUs) */}
      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 md:px-10 pb-8">
          <div className="eyebrow mb-8">Tools mentioned</div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* keep them reading, same glass cards as the index */}
      {readNext.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-6 md:px-10 pt-10 pb-28">
          <div className="eyebrow mb-8">Read next</div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {readNext.map((p) => (
              <NewsCard
                key={p._id || p.slug?.current}
                post={{
                  slug: stegaClean(p.slug?.current) || '',
                  title: p.title || '',
                  excerpt: p.excerpt,
                  img: assetUrl(p.heroImage, 900),
                  alt: stegaClean((p.heroImage as { alt?: string } | null)?.alt) || '',
                  tags: (p.tags ?? []).map((t) => stegaClean(t) || '').filter(Boolean),
                }}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
