import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import MonthlyLineupView from '@/components/MonthlyLineupView';
import { getLineup, getSka } from '@/lib/cms';
import { toolTexture } from '@/lib/data';
import { SITE_URL } from '@/lib/site';

/** One month at its permanent address: /monthly/2026-07.
 *
 *  Every lineup gets one, so a link shared in a newsletter, posted on social or
 *  printed on a QR code keeps showing the month it promised instead of
 *  silently becoming whatever is current. The month that happens to be live
 *  redirects to /monthly, so there is exactly one canonical URL for "now" and
 *  the two never compete in search results.
 *
 *  Not prerendered: months are added in the CMS and the archive must pick them
 *  up without a deploy. The lineup fetch is cached by the Sanity live layer. */

const PERIOD = /^20\d\d-(0[1-9]|1[0-2])$/;

export async function generateMetadata({ params }: { params: Promise<{ period: string }> }): Promise<Metadata> {
  const { period } = await params;
  const SKA = await getLineup(period);
  if (!SKA) return { title: 'STROXX' };
  return {
    title: `${SKA.month} ${SKA.year}: ${SKA.hero.name}`,
    description: `The STROXX of the Month for ${SKA.month} ${SKA.year}: the ${SKA.hero.name}, plus that month's five winners and new arrivals. From the archive.`,
    alternates: { canonical: `/monthly/${period}` },
    openGraph: {
      title: `STROXX of the Month · ${SKA.month} ${SKA.year}: ${SKA.hero.name}`,
      description: 'One headline story every month. Quality and value, documented.',
      images: [`${SITE_URL}${toolTexture(SKA.hero.imgId, '50383')}`],
    },
  };
}

export default async function ArchivedMonthPage({ params }: { params: Promise<{ period: string }> }) {
  const { period } = await params;
  if (!PERIOD.test(period)) notFound();

  const [SKA, current] = await Promise.all([getLineup(period), getSka()]);
  if (!SKA) notFound();
  /* the live month has one home, /monthly */
  if (current.period && current.period === SKA.period) redirect('/monthly');

  return <MonthlyLineupView SKA={SKA} archived />;
}
