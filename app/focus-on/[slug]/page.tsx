import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { stegaClean } from '@sanity/client/stega';
import { assetUrl } from '@/sanity/lib/image';
import { getFocusCards, getFocusPage } from '@/lib/cms';
import { getLocale, getLocalePrefix } from '@/lib/locale';
import LandingSections from '@/components/cms/LandingSections';
import MoreFocusStrip from '@/components/focus/MoreFocusStrip';

/** /focus-on/<slug> — one focus product page, built in the Studio from the
 *  shared section blocks (or drafted by the AI page builder, see
 *  .claude/skills/focus-page/REFERENCE.md), with the "More focus products" strip added
 *  automatically. */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getFocusPage(slug);
  if (!doc) return { title: 'STROXX' };
  const og = assetUrl(doc.ogImage, 1200) || assetUrl(doc.cardImage, 1200);
  return {
    title: stegaClean(doc.seoTitle) || stegaClean(doc.title) || 'STROXX',
    description: stegaClean(doc.seoDescription) || stegaClean(doc.teaser) || undefined,
    alternates: { canonical: `/focus-on/${slug}` },
    ...(og ? { openGraph: { images: [{ url: og, width: 1200, height: 630 }] } } : {}),
  };
}

export default async function FocusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [doc, cards, locale, prefix] = await Promise.all([getFocusPage(slug), getFocusCards(), getLocale(), getLocalePrefix()]);
  if (!doc?.sections?.length) notFound();

  /* every page needs exactly one h1: a film hero without words (the Webflow
     LED page opens on film only) gets a screen-reader-only one */
  const first = doc.sections[0];
  const heroHasH1 = first?._type === 'photoHero' && Boolean(stegaClean(first.headline as string | undefined));

  return (
    <main className="bg-ink">
      {!heroHasH1 && <h1 className="sr-only">{doc.title}</h1>}
      <LandingSections sections={doc.sections} docId={doc._id} docType="focusPage" linkPrefix={prefix} />
      {!doc.hideMoreStrip && <MoreFocusStrip cards={cards} currentSlug={slug} prefix={prefix} htmlLang={locale.htmlLang} />}
    </main>
  );
}
