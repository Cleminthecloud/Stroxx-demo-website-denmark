import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { stegaClean } from '@sanity/client/stega';
import { getLandingPage } from '@/lib/cms';
import LandingSections from '@/components/cms/LandingSections';
import { CR_BRAND, UTM } from '@/lib/data';

/** Every landingPage document an editor creates in the Studio gets a URL here
 *  automatically: slug "sommer-kampagne" → /kampagne/sommer-kampagne.
 *  (/proev-det keeps its own route since it predates the CMS and is linked
 *  everywhere; its doc simply carries that slug.) */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const doc = await getLandingPage((await params).slug);
  if (!doc) return { title: 'STROXX' };
  return {
    title: stegaClean(doc.seoTitle) || stegaClean(doc.title) || 'STROXX',
    description: stegaClean(doc.seoDescription) || undefined,
    alternates: { canonical: `/kampagne/${(await params).slug}` },
  };
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // /proev-det owns its own route; don't render it twice
  if (slug === 'proev-det') notFound();
  const doc = await getLandingPage(slug);
  if (!doc?.sections?.length) notFound();
  const buy = `${CR_BRAND}/?${UTM}`;

  return (
    <main className="bg-ink">
      <LandingSections sections={doc.sections} buy={buy} docId={doc._id} />
    </main>
  );
}
