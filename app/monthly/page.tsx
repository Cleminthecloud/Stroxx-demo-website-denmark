import type { Metadata } from 'next';
import MonthlyLineupView from '@/components/MonthlyLineupView';
import { getSka, getMarkets } from '@/lib/cms';
import { getLocale } from '@/lib/locale';
import { toolTexture } from '@/lib/data';
import { SITE_URL } from '@/lib/site';

/* Månedens STROXX — the SKA hero landing page (docs/STROXX KOMMERCIEL MOTOR.pdf):
   one premium hero product per month gets the full story — claims, cases,
   video, comparison, FAQ, specialist — while the 5 DB2-winners and nyheder
   link straight to the webshop. Newsletter, SoMe and sales all point here.

   This route is always THIS month. Every month also keeps a permanent address
   of its own at /monthly/YYYY-MM, listed at /monthly/archive, so a link shared
   in a newsletter or printed on a QR code still shows what it promised.
   The page body itself lives in components/MonthlyLineupView. */

export async function generateMetadata(): Promise<Metadata> {
  const SKA = await getSka();
  /* market-first dealer copy, same resolution as the page body: name the
     current market's dealer, never a hardcoded one; international stays
     dealer-neutral (BUY CONTRACT) */
  const locale = await getLocale();
  const dealer = (await getMarkets()).find((m) => m.code === locale.market && m.dealerName) ?? null;
  return {
    title: `Tool of the Month: ${SKA.hero.name}`,
    description: `${SKA.month}'s STROXX: the ${SKA.hero.name}, plus the month's five DB2 winners and new arrivals. Quality and value, not just price. 30-day satisfaction guarantee at ${dealer?.dealerName || 'your STROXX dealer'}.`,
    alternates: { canonical: '/monthly' },
    openGraph: {
      title: `STROXX of the Month · ${SKA.month}: ${SKA.hero.name}`,
      description: 'One headline story every month. Quality and value, documented.',
      images: [`${SITE_URL}${toolTexture(SKA.hero.imgId, '50383')}`],
    },
  };
}

export default async function MaanedensPage() {
  return <MonthlyLineupView SKA={await getSka()} />;
}
