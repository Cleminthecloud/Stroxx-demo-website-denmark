import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PortableText } from 'next-sanity';
import { getPost, getPosts, productsBySkus } from '@/lib/cms';
import ProductCard from '@/components/ProductCard';
import ArticleProductSlider from '@/components/ArticleProductSlider';
import ReadingProgress from '@/components/ReadingProgress';
import { assetUrl } from '@/sanity/lib/image';
import { stegaClean } from '@sanity/client/stega';
import { SITE_URL } from '@/lib/site';
import ShareRow from '@/components/ShareRow';
import NewsCard from '@/components/NewsCard';

/** One news article, designed as long-form editorial: a 68ch reading column
 *  with generous type, images and product sliders breaking out WIDER than the
 *  text (the Medium rhythm), an "In this article" jump list for longer
 *  pieces, reading time in the meta, and a quiet blue progress bar. The
 *  product slider block lets editors drop SKUs mid-article; PIM supplies the
 *  data, the DAM knockout pipeline the floating cut-outs. */

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

/* anchor ids for h2s: "Green or red?" → "green-or-red" */
const anchorId = (text: string) =>
  stegaClean(text).toLowerCase().replace(/[^a-z0-9æøå]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

type Block = { _type?: string; style?: string; children?: { text?: string }[] };
const blockText = (b: Block) => (b.children ?? []).map((c) => c.text ?? '').join('');

/* the reading column is 42rem; these classes push media WIDER than the text,
   the long-form breathing room every good editorial layout uses */
const BREAKOUT = 'md:w-[calc(100%+10rem)] md:-ml-20 lg:w-[calc(100%+16rem)] lg:-ml-32';

const components = {
  types: {
    image: ({ value }: { value: { alt?: string; caption?: string } }) => {
      const src = assetUrl(value, 2000);
      if (!src) return null;
      return (
        <figure className={`my-12 ${BREAKOUT}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={stegaClean(value.alt) || ''} loading="lazy" className="w-full rounded-2xl" />
          {value.caption && <figcaption className="mt-3 text-fog/60 text-sm text-center">{value.caption}</figcaption>}
        </figure>
      );
    },
    productSlider: ({ value }: { value: { title?: string; skus?: string[] } }) => (
      <div className={BREAKOUT}>
        <ArticleProductSlider title={value.title} skus={(value.skus ?? []).map((s) => stegaClean(s) || '')} />
      </div>
    ),
  },
  block: {
    h2: (({ children, value }: { children?: React.ReactNode; value?: Block }) => (
      <h2 id={anchorId(blockText(value ?? {}))} className="scroll-mt-28 !mt-16 mb-1">
        <span aria-hidden className="block h-[3px] w-10 rounded-full mb-5" style={{ background: 'linear-gradient(90deg, #0082CA, rgba(0,130,202,0))' }} />
        {children}
      </h2>
      /* the library's block-component type is stricter than what it calls with */
    )) as never,
  },
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const doc = await getPost(slug);
  if (!doc) notFound();
  const relatedProducts = productsBySkus(doc.relatedSkus);
  const readNext = (await getPosts()).filter((p) => stegaClean(p.slug?.current) !== slug).slice(0, 3);
  const hero = assetUrl(doc.heroImage, 2600);
  const heroAlt = stegaClean((doc.heroImage as { alt?: string } | null)?.alt) || '';
  const date = fmtDate(doc.publishedAt);
  const tags = (doc.tags ?? []).map((t) => stegaClean(t) || '').filter(Boolean);

  /* reading time + jump list, derived from the body itself */
  const blocks = (doc.body ?? []) as Block[];
  const words = blocks.filter((b) => b._type === 'block').reduce((a, b) => a + blockText(b).split(/\s+/).filter(Boolean).length, 0);
  const minutes = Math.max(1, Math.round(words / 220));
  const headings = blocks.filter((b) => b._type === 'block' && b.style === 'h2').map(blockText).filter(Boolean);

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
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── editorial header: wide stage, huge headline, lede, meta ── */}
      <header className="mx-auto max-w-[1200px] px-6 md:px-10 pt-36">
        <Link href="/nyheder" className="link-arrow mb-10">
          <ArrowLeft size={14} /> All news
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
          {date && <span className="eyebrow !mb-0">{date}</span>}
          {tags.map((t) => (
            <span key={t} className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border border-white/15 text-white/75">
              {t}
            </span>
          ))}
        </div>
        <h1 className="h-display text-white text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[0.95] max-w-4xl mb-7">{doc.title}</h1>
        {doc.excerpt && <p className="text-fog text-xl md:text-2xl leading-relaxed max-w-2xl mb-6">{doc.excerpt}</p>}
        <div className="text-fog/60 text-sm mb-12">{minutes} min read · STROXX</div>
        {hero && (
          <figure className="relative overflow-hidden rounded-2xl">
            <div className="pointer-events-none absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg, rgba(11,12,14,0) 60%, rgba(11,12,14,0.45) 100%)' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero} alt={heroAlt} className="w-full max-h-[68svh] object-cover" />
          </figure>
        )}
      </header>

      {/* ── the reading column ── */}
      <article className="mx-auto max-w-[42rem] px-6 md:px-0 pt-16 pb-24">
        {headings.length >= 3 && (
          <nav aria-label="In this article" className="glass-panel rounded-xl p-6 mb-12">
            <div className="eyebrow mb-4">In this article</div>
            <ol className="space-y-2.5">
              {headings.map((h, i) => (
                <li key={h}>
                  <a href={`#${anchorId(h)}`} className="group inline-flex items-baseline gap-3 text-[15px] text-fog hover:text-white transition-colors">
                    <span className="text-stroxx-blue text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <span className="underline-offset-4 group-hover:underline">{h}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {doc.body ? (
          <div className="text-fog text-[1.15rem] leading-[1.8] space-y-6 [&_strong]:text-white [&_h2]:text-white [&_h2]:h-display [&_h2]:text-3xl [&_h3]:text-white [&_h3]:text-xl [&_h3]:mt-10 [&_a]:text-stroxx-blue [&_a]:underline [&_a]:decoration-stroxx-blue/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-stroxx-blue [&_blockquote]:border-l-2 [&_blockquote]:border-stroxx-blue [&_blockquote]:pl-6 [&_blockquote]:py-1 [&_blockquote]:text-white [&_blockquote]:text-xl [&_blockquote]:leading-relaxed">
            <PortableText value={doc.body} components={components} />
          </div>
        ) : null}
        <ShareRow url={`${SITE_URL}/nyheder/${slug}`} title={stegaClean(doc.title) || undefined} />
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
