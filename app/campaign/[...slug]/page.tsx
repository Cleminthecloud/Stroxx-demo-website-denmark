import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { stegaClean } from '@sanity/client/stega';
import { assetUrl } from '@/sanity/lib/image';
import { SITE_URL } from '@/lib/site';
import { getLandingPage } from '@/lib/cms';
import LandingSections from '@/components/cms/LandingSections';

/** Every landingPage document an editor creates in the Studio gets a URL here
 *  automatically: slug "sommer" → /campaign/sommer, and slugs may nest with
 *  slashes: "sommer/tilbud" → /campaign/sommer/tilbud. Moving a page is
 *  editing its slug. (/try-it now redirects here to /campaign/try-it.) */

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const path = (await params).slug.join('/');
  const doc = await getLandingPage(path);
  if (!doc) return { title: 'STROXX' };
  /* Share image falls back to the page's own hero (upload, then /public path)
     when no explicit share image is set, matching the article behaviour and
     the SEO preview in the Studio. */
  const heroSec = doc.sections?.find((s) => s._type === 'photoHero');
  const heroPath = stegaClean(heroSec?.image as string | undefined);
  const og =
    assetUrl(doc.ogImage, 1200) ||
    assetUrl(heroSec?.imageUpload, 1200) ||
    (heroPath && heroPath.startsWith('/') ? `${SITE_URL}${heroPath}` : undefined);
  return {
    title: stegaClean(doc.seoTitle) || stegaClean(doc.title) || 'STROXX',
    description: stegaClean(doc.seoDescription) || undefined,
    alternates: { canonical: `/campaign/${path}` },
    /* per-page share image; empty = site-wide default from layout metadata */
    ...(og ? { openGraph: { images: [{ url: og, width: 1200, height: 630 }] } } : {}),
  };
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const path = (await params).slug.join('/');
  const doc = await getLandingPage(path);
  if (!doc?.sections?.length) notFound();

  return (
    <main className="bg-ink">
      <LandingSections sections={doc.sections} docId={doc._id} />
    </main>
  );
}
