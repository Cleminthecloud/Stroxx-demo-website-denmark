import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { stegaClean } from '@sanity/client/stega';
import { assetUrl } from '@/sanity/lib/image';
import { getLandingPage } from '@/lib/cms';
import LandingSections from '@/components/cms/LandingSections';
import { CR_BRAND, UTM } from '@/lib/data';

/** Every landingPage document an editor creates in the Studio gets a URL here
 *  automatically: slug "sommer" → /kampagne/sommer, and slugs may nest with
 *  slashes: "sommer/tilbud" → /kampagne/sommer/tilbud. Moving a page is
 *  editing its slug. (/proev-det now redirects here to /kampagne/proev-det.) */

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const path = (await params).slug.join('/');
  const doc = await getLandingPage(path);
  if (!doc) return { title: 'STROXX' };
  const og = assetUrl(doc.ogImage, 1200);
  return {
    title: stegaClean(doc.seoTitle) || stegaClean(doc.title) || 'STROXX',
    description: stegaClean(doc.seoDescription) || undefined,
    alternates: { canonical: `/kampagne/${path}` },
    /* per-page share image; empty = site-wide default from layout metadata */
    ...(og ? { openGraph: { images: [{ url: og, width: 1200, height: 630 }] } } : {}),
  };
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const path = (await params).slug.join('/');
  const doc = await getLandingPage(path);
  if (!doc?.sections?.length) notFound();
  const buy = `${CR_BRAND}/?${UTM}`;

  return (
    <main className="bg-ink">
      <LandingSections sections={doc.sections} buy={buy} docId={doc._id} />
    </main>
  );
}
