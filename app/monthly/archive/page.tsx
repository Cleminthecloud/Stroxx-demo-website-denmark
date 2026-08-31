import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import ScrollText from '@/components/ScrollText';
import MonthlyArchiveList from '@/components/MonthlyArchiveList';
import { ArrowRight } from 'lucide-react';
import { getLineupArchive, getSka } from '@/lib/cms';
import { SITE_URL } from '@/lib/site';

/** The archive of every Månedens STROXX. Each month keeps a permanent address
 *  (/monthly/YYYY-MM) and is listed here, searchable by month, tool name or
 *  item number, so an old newsletter link, a QR code or a sales conversation
 *  can always find the month it refers to. */

export const metadata: Metadata = {
  title: 'Tool of the Month: the archive',
  description:
    'Every STROXX of the Month we have published, month by month. Search by month, tool or item number and open the full story for any of them.',
  alternates: { canonical: '/monthly/archive' },
};

export default async function MonthlyArchivePage() {
  const [months, current] = await Promise.all([getLineupArchive(), getSka()]);

  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'STROXX of the Month archive',
    itemListElement: months.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${m.month} ${m.year}: ${m.heroName}`.trim(),
      url: `${SITE_URL}/monthly/${m.period}`,
    })),
  };

  return (
    <main className="bg-ink min-h-screen overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-32 md:pt-40 pb-20 md:pb-28">
          <Reveal>
            <div className="eyebrow mb-5">The archive</div>
          </Reveal>
          <ScrollText
            as="h1"
            text={'Every month, \n *still here.*'}
            className="h-display text-white text-[clamp(2.6rem,6vw,5rem)] leading-[0.94] mb-6"
          />
          <Reveal delay={100}>
            <p className="max-w-xl text-fog text-lg leading-relaxed mb-4">
              One tool gets the full story every month. Nothing is taken down when the next month arrives: search here for a
              month, a tool or an item number and open it exactly as it ran.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <Link href="/monthly" className="link-arrow mb-12 inline-flex">
              See this month <ArrowRight size={15} />
            </Link>
          </Reveal>

          {months.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-fog">
              The first month is on its way. <Link href="/monthly" className="text-stroxx-blue hover:text-white">See this month</Link>.
            </p>
          ) : (
            <MonthlyArchiveList months={months} currentPeriod={current.period} />
          )}
        </div>
      </section>
    </main>
  );
}
